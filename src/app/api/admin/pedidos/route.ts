import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { z } from 'zod'

const OrderUpdateSchema = z.object({
    id: z.string().min(1, "Order ID is required"),
    status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
    trackingNumber: z.string().optional().nullable(),
    trackingCompany: z.string().optional().nullable(),
})

export async function GET() {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(orders)
    } catch (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    try {
        const body = await req.json()
        const parsed = OrderUpdateSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Payload inválido', details: parsed.error.format() }, { status: 400 })
        }

        const { id, status, trackingNumber, trackingCompany } = parsed.data

        const order = await prisma.order.update({
            where: { id },
            data: { 
                status,
                trackingNumber,
                trackingCompany
            }
        })

        if (status === 'SHIPPED') {
            const { sendShippingNotification } = await import('@/lib/email')
            await sendShippingNotification(order)
        }

        return NextResponse.json(order)
    } catch (error) {
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
