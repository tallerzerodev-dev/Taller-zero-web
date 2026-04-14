import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const PhotoCreateSchema = z.object({
    url: z.string().url("Must be a valid URL").max(2000, "URL is too long"),
    caption: z.string().max(500, "Caption max length is 500 chars").optional().nullable(),
    sessionId: z.string().optional().nullable(),
})

const PhotoDeleteSchema = z.object({
    id: z.string().min(1, "Missing ID")
})

export async function GET(request: Request) {
    try {
        const photos = await prisma.photo.findMany({
            orderBy: { createdAt: 'desc' },
            include: { session: true }
        })
        const sessions = await prisma.session.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json({ photos, sessions })
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = PhotoCreateSchema.safeParse(body)
        
        if (!parsed.success) {
            return NextResponse.json({ error: 'Payload inválido', details: parsed.error.format() }, { status: 400 })
        }
        
        const data = parsed.data

        const photo = await prisma.photo.create({
            data: {
                url: data.url,
                caption: data.caption || null,
                sessionId: data.sessionId || null,
            }
        })
        return NextResponse.json(photo)
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        
        const parsed = PhotoDeleteSchema.safeParse({ id })
        if (!parsed.success) {
            return NextResponse.json({ error: 'ID inválido o faltante' }, { status: 400 })
        }

        await prisma.photo.delete({ where: { id: parsed.data.id } })
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}