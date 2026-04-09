import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
        const photo = await prisma.photo.create({
            data: {
                url: body.url,
                caption: body.caption,
                sessionId: body.sessionId || null,
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
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

        await prisma.photo.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}