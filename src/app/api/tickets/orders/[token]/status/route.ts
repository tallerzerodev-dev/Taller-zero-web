import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { getTicketOrderStatus } from '@/lib/tickets';

export const dynamic = 'force-dynamic';

// Estado de una orden de entradas para quien está esperando su pago. El token es el secreto de la orden
// (128 bits): sin él no se puede consultar nada.
export async function GET(req: Request, { params }: { params: { token: string } }) {
    if (!/^[a-f0-9]{32}$/.test(params.token)) {
        return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }
    if (!(await checkRateLimit('token', req.headers))) {
        return NextResponse.json({ error: 'Demasiadas consultas, espera un momento.' }, { status: 429 });
    }

    try {
        const reconcile = new URL(req.url).searchParams.get('reconcile') === '1';
        const status = await getTicketOrderStatus(params.token, reconcile);
        if (!status) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
        return NextResponse.json(status, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
        console.error('Error consultando el estado de la orden de entradas:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
