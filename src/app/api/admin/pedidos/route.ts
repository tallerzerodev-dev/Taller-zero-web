import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

const OrderUpdateSchema = z.object({
    id: z.string().min(1, "Order ID is required"),
    status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
})

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const orders = await prisma.order.findMany({
        include: {
            items: {
                include: { product: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(orders)
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    try {
        const body = await req.json()
        const parsed = OrderUpdateSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Payload inválido', details: parsed.error.format() }, { status: 400 })
        }

        const { id, status } = parsed.data

        const order = await prisma.order.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(order)
    } catch (error) {
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
