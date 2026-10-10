import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { z } from 'zod'

const ProductSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    price: z.union([z.string(), z.number()]).transform(v => Number(v)).refine(n => !isNaN(n) && n >= 0, "Price cannot be negative"),
    description: z.string().optional(),
    category: z.string().default("Ropa"),
    stock: z.union([z.string(), z.number()]).transform(v => Number(v)).refine(n => !isNaN(n) && n >= 0, "Stock cannot be negative"),
    sizes: z.array(z.string()).default([]),
    colors: z.array(z.string()).default([]),
    images: z.array(z.string().url()).default([]),
    isAvailable: z.boolean().default(true),
})

export async function GET() {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(products)
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

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
                colors: data.colors,
                images: data.images,
                isAvailable: data.isAvailable
            }
        })

        return NextResponse.json(newProduct)
    } catch (error) {
        console.error('Error saving product:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

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
                colors: data.colors,
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
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Falta ID' }, { status: 400 })

    try {
        await prisma.product.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        // onDelete: Restrict en OrderItem: un producto con ventas no se puede borrar
        console.error('Error deleting product:', error)
        return NextResponse.json({ error: 'No se pudo eliminar. Si el producto tiene pedidos asociados, márcalo como no disponible.' }, { status: 409 })
    }
}
