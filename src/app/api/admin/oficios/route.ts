import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

const OficioSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    coverImage: z.string().url().optional().or(z.literal('')),
    bio: z.string().optional(),
    images: z.array(z.string()).optional(),
    instagram: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional()
})

export async function GET() {
    try {
        const oficios = await prisma.oficio.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(oficios)
    } catch (error) {
        console.error('Error fetching oficios:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    try {
        const body = await req.json()
        const parsed = OficioSchema.safeParse(body)
        
        if (!parsed.success) {
            return NextResponse.json({ error: 'Payload inválido', details: parsed.error.format() }, { status: 400 })
        }

        const data = parsed.data

        const newOficio = await prisma.oficio.create({
            data: {
                name: data.name,
                coverImage: data.coverImage || null,
                bio: data.bio || null,
                images: data.images || [],
                instagram: data.instagram || null,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null
            }
        })

        return NextResponse.json(newOficio)
    } catch (error) {
        console.error('Error creating oficio:', error)
        return NextResponse.json({ error: 'Error del servidor', details: String(error) }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    try {
        const body = await req.json()
        const parsed = OficioSchema.safeParse(body)
        
        if (!parsed.success || !parsed.data.id) {
            return NextResponse.json({ error: 'Payload inválido o falta ID', details: !parsed.success ? parsed.error.format() : 'Missing ID' }, { status: 400 })
        }

        const { id, ...data } = parsed.data

        const updatedOficio = await prisma.oficio.update({
            where: { id },
            data: {
                name: data.name,
                coverImage: data.coverImage || null,
                bio: data.bio || null,
                images: data.images || [],
                instagram: data.instagram || null,
                email: data.email || null,
                phone: data.phone || null,
                address: data.address || null
            }
        })

        return NextResponse.json(updatedOficio)
    } catch (error) {
        console.error('Error updating oficio:', error)
        return NextResponse.json({ error: 'Error del servidor', details: String(error) }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 })

    try {
        await prisma.oficio.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting oficio:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
