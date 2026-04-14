import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function GET() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { title, price, description, category, stock, sizes, images, isAvailable } = body

    if (!title || price === undefined) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

    const newProduct = await prisma.product.create({
        data: {
            title,
            price: Number(price),
            description,
            category,
            stock: Number(stock),
            sizes,
            images,
            isAvailable
        }
    })

    return NextResponse.json(newProduct)
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const { id, title, price, description, category, stock, sizes, images, isAvailable } = body

    if (!id) return NextResponse.json({ error: 'Falta ID' }, { status: 400 })

    const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
            title,
            price: Number(price),
            description,
            category,
            stock: Number(stock),
            sizes,
            images,
            isAvailable
        }
    })

    return NextResponse.json(updatedProduct)
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Falta ID' }, { status: 400 })

    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
}
