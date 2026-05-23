import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: Request) {
    try {
        // 1. Obtener headers para la validación
        const xSignature = request.headers.get('x-signature');
        const xRequestId = request.headers.get('x-request-id');

        if (!xSignature || !xRequestId) {
            return NextResponse.json({ error: 'Missing headers' }, { status: 400 });
        }

        // 2. Obtener data.id de los query params (Mercado Pago lo envía así en Webhooks)
        const url = new URL(request.url);
        const dataID = url.searchParams.get('data.id');
        const type = url.searchParams.get('type');

        if (!dataID || type !== 'payment') {
            // Si no es un evento de pago o falta el ID, ignoramos pero respondemos 200 OK
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 3. Extraer 'ts' (timestamp) y 'v1' (hash) del header x-signature
        const parts = xSignature.split(',');
        let ts = '';
        let hash = '';

        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                const trimmedKey = key.trim();
                const trimmedValue = value.trim();
                if (trimmedKey === 'ts') ts = trimmedValue;
                if (trimmedKey === 'v1') hash = trimmedValue;
            }
        });

        const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
        if (!secret) {
            console.error('MERCADOPAGO_WEBHOOK_SECRET no configurado');
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        // 4. Generar el string manifiesto
        const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

        // 5. Crear la firma HMAC y comparar
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(manifest);
        const sha = hmac.digest('hex');

        if (sha !== hash) {
            console.error('Webhook signature validation failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // 6. Si la firma es válida, consultar a la API de Mercado Pago por el estado del pago
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN_TEST;
        if (!accessToken) {
            return NextResponse.json({ error: 'Access token missing' }, { status: 500 });
        }

        const client = new MercadoPagoConfig({ accessToken });
        const paymentClient = new Payment(client);
        
        const paymentData = await paymentClient.get({ id: dataID });

        // El external_reference es nuestro ID de orden generado en el checkout
        const orderId = paymentData.external_reference;
        const status = paymentData.status;

        if (orderId) {
            // Mapeamos los estados de Mercado Pago a nuestro sistema (PENDING, PAID, CANCELLED)
            let newStatus = 'PENDING';
            if (status === 'approved') {
                newStatus = 'PAID';
            } else if (status === 'rejected' || status === 'cancelled' || status === 'refunded') {
                newStatus = 'CANCELLED';
            }

            // Actualizamos en la base de datos
            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: { status: newStatus },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });
            console.log(`Orden ${orderId} actualizada a ${newStatus}`);

            // Enviar correo de confirmación si fue aprobada
            if (newStatus === 'PAID') {
                const { sendPurchaseConfirmation } = await import('@/lib/email');
                await sendPurchaseConfirmation(updatedOrder);
            }
        }

        // Siempre responder 200 OK a Mercado Pago para confirmar recepción
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('Error procesando el Webhook de Mercado Pago:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
