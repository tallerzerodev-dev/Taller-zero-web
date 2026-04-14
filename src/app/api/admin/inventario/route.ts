import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

const ProductSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required").transform(val => DOMPurify.sanitize(val)),
    price: z.union([z.string(), z.number()]).transform(v => Number(v)).refine(n => !isNaN(n) && n >= 0, "Price cannot be negative"),
    description: z.string().optional().transform(val => val ? DOMPurify.sanitize(val) : val),
    category: z.string().default("Ropa").transform(val => DOMPurify.sanitize(val)),
    stock: z.union([z.string(), z.number()]).transform(v => Number(v)).refine(n => !isNaN(n) && n >= 0, "Stock cannot be negative"),
    sizes: z.array(z.string().transform(val => DOMPurify.sanitize(val))).default([]),
    images: z.array(z.string().url()).default([]),
    isAvailable: z.boolean().default(true),
})

export async function GET() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(products)
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    try {
        const body = await req.json()
        const parsed = ProductSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: 'Payload inválido', details: parsed.error.format() }, { status: 400 })
        }

        const data = parsed.data

        const newProduct = await prisma.product.create({
            data: {
                title: data.title,
                price: data.price,
                description: data.description || null,
                category: data.category,
                stock: data.stock,
                sizes: data.sizes,
                images: data.images,
                isAvailable: data.isAvailable
            }
        })

        return NextResponse.json(newProduct)
    } catch (error) {
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    try {
        const body = await req.json()
        const parsed = ProductSchema.safeParse(body)

        if (!parsed.success || !parsed.data.id) {
            return NextResponse.json({ error: 'Payload inválido o falta ID', details: !parsed.success ? parsed.error.format() : 'Missing ID' }, { status: 400 })
        }

        const { id, ...data } = parsed.data

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                title: data.title,
                price: data.price,
                description: data.description || null,
                category: data.category,
                stock: data.stock,
                sizes: data.sizes,
                images: data.images,
                isAvailable: data.isAvailable
            }
        })

        return NextResponse.json(updatedProduct)
    } catch (error) {
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
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
