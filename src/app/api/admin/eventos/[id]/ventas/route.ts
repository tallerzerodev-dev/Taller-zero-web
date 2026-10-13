import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { deliverTickets, releaseExpiredReservations } from '@/lib/tickets'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    try {
        await releaseExpiredReservations(params.id)

        const event = await prisma.event.findUnique({
            where: { id: params.id },
            include: { ticketTypes: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
        })
        if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

        // Las reservas vencidas sin pago no aportan nada al panel
        const orders = await prisma.ticketOrder.findMany({
            where: { eventId: params.id, OR: [{ status: { not: 'EXPIRED' } }, { paymentId: { not: null } }] },
            orderBy: { createdAt: 'desc' },
            take: 2000,
            select: {
                id: true, buyerName: true, buyerEmail: true, buyerPhone: true, status: true, totalAmount: true,
                paymentId: true, paidAt: true, emailSentAt: true, reviewNote: true, createdAt: true,
                items: { select: { quantity: true, priceAtTime: true, ticketType: { select: { name: true } } } },
                tickets: { select: { folio: true, status: true, usedAt: true, ticketType: { select: { name: true } } }, orderBy: { folio: 'asc' } },
            },
        })

        return NextResponse.json({ event, orders })
    } catch (error) {
        console.error('Error fetching ticket sales:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

// Reenviar el correo con las entradas de una orden pagada
export async function POST(req: Request, { params }: { params: { id: string } }) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    try {
        const parsed = z.object({ orderId: z.string().min(1).max(64) }).safeParse(await req.json().catch(() => null))
        if (!parsed.success) return NextResponse.json({ error: 'Orden inválida' }, { status: 400 })

        const order = await prisma.ticketOrder.findFirst({
            where: { id: parsed.data.orderId, eventId: params.id, status: 'PAID' },
            select: { id: true },
        })
        if (!order) return NextResponse.json({ error: 'La orden no existe o no está pagada' }, { status: 404 })

        const sent = await deliverTickets(order.id)
        if (!sent) return NextResponse.json({ error: 'No se pudo enviar el correo' }, { status: 502 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error resending tickets:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
