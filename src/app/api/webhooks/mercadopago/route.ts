import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { syncOrderFromPayment } from '@/lib/payments';

function signaturesMatch(expectedHex: string, receivedHex: string): boolean {
    const expected = Buffer.from(expectedHex, 'hex');
    const received = Buffer.from(receivedHex, 'hex');
    // timingSafeEqual exige el mismo largo; un largo distinto ya es una firma inválida
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

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

        // 4. Generar el string manifiesto (Mercado Pago firma el data.id en minúsculas)
        const manifest = `id:${dataID.toLowerCase()};request-id:${xRequestId};ts:${ts};`;

        // 5. Crear la firma HMAC y comparar
        const sha = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

        if (!signaturesMatch(sha, hash)) {
            console.error('Webhook signature validation failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
        }

        // 6. La firma solo prueba que el aviso es de Mercado Pago. El estado, el monto y la orden
        // se leen de su API dentro de syncOrderFromPayment, que además es idempotente:
        // un aviso repetido o reenviado no cambia nada.
        const result = await syncOrderFromPayment(dataID);
        console.log(`Webhook Mercado Pago: pago ${dataID} -> ${result.outcome}`);

        // Siempre responder 200 OK a Mercado Pago para confirmar recepción
        return NextResponse.json({ received: true }, { status: 200 });

    } catch (error) {
        console.error('Error procesando el Webhook de Mercado Pago:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
