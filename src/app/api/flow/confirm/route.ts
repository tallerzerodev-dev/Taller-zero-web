import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function signParams(params: Record<string, any>, secretKey: string) {
    const keys = Object.keys(params).sort();
    let toSign = '';
    for (const key of keys) {
        toSign += key + params[key];
    }
    return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
}

export async function POST(req: Request) {
    try {
        // Flow envía los datos como x-www-form-urlencoded
        const bodyText = await req.text();
        const formData = new URLSearchParams(bodyText);
        const token = formData.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Falta token' }, { status: 400 });
        }

        const apiKey = process.env.FLOW_API_KEY || '';
        const secretKey = process.env.FLOW_SECRET_KEY || '';

        if (!apiKey || !secretKey) {
            console.error('Flow Webhook: Credenciales no configuradas');
            return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 });
        }

        // Para confirmar el pago, debemos consultar el estado a Flow usando el token
        const params = { apiKey, token };
        const s = signParams(params, secretKey);
        const payload = { ...params, s };

        const flowRes = await fetch(`https://sandbox.flow.cl/api/payment/getStatus?${new URLSearchParams(payload as any).toString()}`, {
            method: 'GET',
        });

        const flowData = await flowRes.json();

        if (!flowRes.ok) {
            console.error('Flow Webhook: Error al consultar estado', flowData);
            return NextResponse.json({ error: 'Error al consultar Flow' }, { status: 400 });
        }

        // Actualizar la orden en la base de datos
        // flowData.status = 1 (Pendiente), 2 (Pagado), 3 (Rechazado), 4 (Anulado)
        let orderStatus = 'PENDING';
        if (flowData.status === 2) {
            orderStatus = 'PAID';
        } else if (flowData.status === 3 || flowData.status === 4) {
            orderStatus = 'CANCELLED';
        }

        await prisma.order.update({
            where: { id: flowData.commerceOrder },
            data: { status: orderStatus }
        });

        console.log(`Flow Webhook: Orden ${flowData.commerceOrder} actualizada a ${orderStatus}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Flow Webhook: Error del servidor', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
