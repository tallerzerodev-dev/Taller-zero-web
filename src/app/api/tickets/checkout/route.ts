import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/ratelimit';
import { createCardOnlyPreference } from '@/lib/mercadopago';
import {
    cancelPendingTicketOrder,
    createTicketOrder,
    TicketPurchaseError,
    TICKET_ORDER_REF_PREFIX,
} from '@/lib/tickets';

// El navegador solo dice qué tramos y cuántas entradas. Precio, total, cupo e ID de orden los decide
// el servidor; .strict() rechaza cualquier campo extra.
const TicketCheckoutSchema = z.object({
    eventSlug: z.string().min(1).max(80),
    items: z.array(z.object({
        ticketTypeId: z.string().min(1).max(64),
        quantity: z.number().int().min(1).max(20),
    }).strict()).min(1).max(12),
    firstName: z.string().trim().min(2).max(60),
    lastName: z.string().trim().min(2).max(60),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(6).max(30),
    acceptTerms: z.literal(true),
}).strict();

export async function POST(req: Request) {
    if (!(await checkRateLimit('checkout', req.headers))) {
        return NextResponse.json({ error: 'Demasiados intentos, espera unos minutos.' }, { status: 429 });
    }

    try {
        const parsed = TicketCheckoutSchema.safeParse(await req.json().catch(() => null));
        if (!parsed.success) {
            return NextResponse.json({ error: 'Datos de compra inválidos. Revisa el formulario e intenta de nuevo.' }, { status: 400 });
        }
        const data = parsed.data;
        const session = await getServerSession(authOptions);
        const buyerName = `${data.firstName} ${data.lastName}`;

        const { order, event, lines } = await createTicketOrder({
            eventSlug: data.eventSlug,
            items: data.items,
            buyerName,
            buyerEmail: data.email,
            buyerPhone: data.phone,
            userEmail: session?.user?.email,
        });

        try {
            const { id: preferenceId, initPoint } = await createCardOnlyPreference({
                items: lines.map(({ item, type }) => ({
                    id: type.id,
                    title: `${event.title} - ${type.name}`,
                    quantity: item.quantity,
                    unit_price: item.priceAtTime,
                })),
                payer: { name: buyerName, email: order.buyerEmail },
                externalReference: `${TICKET_ORDER_REF_PREFIX}${order.id}`,
                resultPath: `/eventos/resultado/${order.accessToken}`,
                // Mercado Pago deja de aceptar el pago cuando vence la reserva del cupo
                expiresAt: order.expiresAt,
                requestUrl: req.url,
            });

            return NextResponse.json({ preferenceId, initPoint, expiresAt: order.expiresAt.toISOString() });
        } catch (error) {
            // Sin cobro no tiene sentido retener el cupo
            await cancelPendingTicketOrder(order.id);
            throw error;
        }
    } catch (error) {
        if (error instanceof TicketPurchaseError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('ERROR CREATING TICKET ORDER:', error);
        return NextResponse.json({ error: 'No se pudo generar el pago. Intenta nuevamente.' }, { status: 500 });
    }
}
