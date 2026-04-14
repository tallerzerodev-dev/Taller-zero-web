import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

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

    const body = await req.json()
    const { id, status } = body

    if (!id) return NextResponse.json({ error: 'Falta ID' }, { status: 400 })

    const order = await prisma.order.update({
        where: { id },
        data: { status }
    })

    return NextResponse.json(order)
}
