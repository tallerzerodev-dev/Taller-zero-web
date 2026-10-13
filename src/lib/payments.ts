import { prisma } from './prisma';
import { fetchPayment, isCardPayment, type MercadoPagoPayment } from './mercadopago';
import { syncTicketOrderFromPayment, TICKET_ORDER_REF_PREFIX } from './tickets';

export type SyncResult = {
    kind: 'store' | 'tickets';
    outcome: 'paid' | 'already_processed' | 'cancelled' | 'pending' | 'amount_mismatch' | 'ignored';
    orderId?: string;
};

// Única vía por la que una orden cambia de estado por un pago. Todo lo que decide
// (orden, monto, estado) sale de la respuesta de Mercado Pago, nunca del navegador.
// Es idempotente: se puede llamar varias veces con el mismo pago.
export async function syncPayment(paymentId: string): Promise<SyncResult> {
    const payment = await fetchPayment(paymentId);

    if (payment.external_reference?.startsWith(TICKET_ORDER_REF_PREFIX)) {
        return { kind: 'tickets', ...(await syncTicketOrderFromPayment(payment)) };
    }
    return { kind: 'store', ...(await syncStoreOrderFromPayment(payment)) };
}

// Órdenes de la tienda (ropa)
async function syncStoreOrderFromPayment(payment: MercadoPagoPayment): Promise<Omit<SyncResult, 'kind'>> {
    const paymentId = String(payment.id);
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

            const reviewNotes: string[] = [];

            if (!isCardPayment(payment)) {
                reviewNotes.push(`Pagada con "${payment.payment_type_id ?? 'medio desconocido'}" (no es tarjeta): el comprobante de Mercado Pago NO vale como boleta. Emitir boleta manual.`);
            }

            const withoutStock: string[] = [];
            for (const item of order.items) {
                const decremented = await tx.product.updateMany({
                    where: { id: item.productId, stock: { gte: item.quantity } },
                    data: { stock: { decrement: item.quantity } },
                });
                if (decremented.count === 0) withoutStock.push(item.productId);
            }
            if (withoutStock.length > 0) {
                reviewNotes.push(`Pagada sin stock suficiente para: ${withoutStock.join(', ')}. Reponer o reembolsar.`);
            }
            if (reviewNotes.length > 0) {
                await tx.order.update({
                    where: { id: orderId },
                    data: { reviewNote: reviewNotes.join(' | ') },
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

    // Un pago rechazado no anula la orden: Mercado Pago deja reintentar con otra tarjeta sobre
    // la misma preferencia, y ese segundo pago tiene que poder marcarla como pagada.

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
