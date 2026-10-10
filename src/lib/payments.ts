import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from './prisma';

const PRODUCTION_URL = 'https://www.taller-zero.cl';

export function getMercadoPagoAccessToken(): string {
    return process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN_TEST || '';
}

export function getSiteUrl(): string {
    return (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_URL).replace(/\/$/, '');
}

export type SyncResult =
    | { outcome: 'paid' | 'already_processed' | 'cancelled' | 'pending' | 'amount_mismatch'; orderId: string }
    | { outcome: 'ignored'; orderId?: undefined };

// Única vía por la que una orden cambia de estado por un pago. Todo lo que decide
// (orden, monto, estado) sale de la respuesta de Mercado Pago, nunca del navegador.
// Es idempotente: se puede llamar varias veces con el mismo pago.
export async function syncOrderFromPayment(paymentId: string): Promise<SyncResult> {
    const accessToken = getMercadoPagoAccessToken();
    if (!accessToken) throw new Error('Credenciales de Mercado Pago no configuradas');

    const payment = await new Payment(new MercadoPagoConfig({ accessToken })).get({ id: paymentId });

    const orderId = payment.external_reference;
    if (!orderId) return { outcome: 'ignored' };

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
    });
    if (!order) {
        console.error(`Pago ${paymentId} referencia una orden inexistente`);
        return { outcome: 'ignored' };
    }

    const status = payment.status;

    if (status === 'approved') {
        if (payment.transaction_amount !== order.totalAmount || payment.currency_id !== 'CLP') {
            console.error(`Pago ${paymentId}: el monto no coincide con la orden ${orderId}`);
            await prisma.order.update({
                where: { id: orderId },
                data: { reviewNote: `Pago ${paymentId} aprobado por un monto distinto al de la orden. No se marcó como pagada.` },
            });
            return { outcome: 'amount_mismatch', orderId };
        }

        const wasMarkedPaid = await prisma.$transaction(async (tx) => {
            // Solo una ejecución logra pasar la orden de PENDING a PAID
            const updated = await tx.order.updateMany({
                where: { id: orderId, status: 'PENDING' },
                data: { status: 'PAID', paymentId: String(paymentId), paidAt: new Date() },
            });
            if (updated.count === 0) return false;

            const withoutStock: string[] = [];
            for (const item of order.items) {
                const decremented = await tx.product.updateMany({
                    where: { id: item.productId, stock: { gte: item.quantity } },
                    data: { stock: { decrement: item.quantity } },
                });
                if (decremented.count === 0) withoutStock.push(item.productId);
            }
            if (withoutStock.length > 0) {
                await tx.order.update({
                    where: { id: orderId },
                    data: { reviewNote: `Pagada sin stock suficiente para: ${withoutStock.join(', ')}. Reponer o reembolsar.` },
                });
            }
            return true;
        });

        if (!wasMarkedPaid) return { outcome: 'already_processed', orderId };

        try {
            const paidOrder = await prisma.order.findUnique({
                where: { id: orderId },
                include: { items: { include: { product: true } } },
            });
            const { sendPurchaseConfirmation } = await import('./email');
            await sendPurchaseConfirmation(paidOrder);
        } catch (error) {
            console.error(`No se pudo enviar el correo de confirmación de la orden ${orderId}:`, error);
        }
        return { outcome: 'paid', orderId };
    }

    if (status === 'rejected' || status === 'cancelled') {
        // Un pago rechazado no anula una orden que ya fue pagada con otro intento
        await prisma.order.updateMany({
            where: { id: orderId, status: 'PENDING' },
            data: { status: 'CANCELLED' },
        });
        return { outcome: 'cancelled', orderId };
    }

    if (status === 'refunded' || status === 'charged_back') {
        await prisma.$transaction(async (tx) => {
            // Solo se devuelve stock si esta orden estaba pagada por este mismo pago y aún no se despachó
            const refunded = await tx.order.updateMany({
                where: { id: orderId, status: 'PAID', paymentId: String(paymentId) },
                data: { status: 'CANCELLED' },
            });
            if (refunded.count === 0) return;
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
            }
        });
        return { outcome: 'cancelled', orderId };
    }

    return { outcome: 'pending', orderId };
}
