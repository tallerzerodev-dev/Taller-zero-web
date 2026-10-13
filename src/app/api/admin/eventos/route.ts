import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { cancelEvent } from '@/lib/tickets'

const OWN_CLOUDINARY_PREFIX = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/`

const dateTime = z.string().datetime({ offset: true })

const TierSchema = z.object({
    id: z.string().max(64).optional(),
    name: z.string().trim().min(1).max(60),
    price: z.number().int().min(0).max(10_000_000),
    capacity: z.number().int().min(0).max(100_000),
    sortOrder: z.number().int().min(0).max(100).default(0),
    salesStart: dateTime.nullish(),
    salesEnd: dateTime.nullish(),
    isActive: z.boolean().default(true),
    isInfoOnly: z.boolean().default(false),
}).strict().refine(t => t.isInfoOnly || t.price >= 1, { message: 'Un tramo a la venta necesita precio', path: ['price'] })

const EventSchema = z.object({
    id: z.string().max(64).optional(),
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().max(5000).default(''),
    startsAt: dateTime,
    venueName: z.string().trim().min(1).max(120),
    venueAddress: z.string().trim().max(200).default(''),
    coverImage: z.string().max(2000).default('').refine(v => v === '' || v.startsWith(OWN_CLOUDINARY_PREFIX), 'La portada debe subirse desde el panel'),
    lineup: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
    tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
    minAge: z.number().int().min(0).max(99).nullish(),
    maxPerOrder: z.number().int().min(1).max(20).default(6),
    status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
    ticketTypes: z.array(TierSchema).max(12).default([]),
}).strict()

class ConflictError extends Error {}

function slugify(title: string): string {
    return title
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'evento'
}

async function uniqueSlug(title: string): Promise<string> {
    const base = slugify(title)
    const taken = base === 'resultado' || await prisma.event.findUnique({ where: { slug: base }, select: { id: true } })
    return taken ? `${base}-${crypto.randomBytes(3).toString('hex')}` : base
}

function tierData(tier: z.infer<typeof TierSchema>) {
    return {
        name: tier.name,
        price: tier.price,
        sortOrder: tier.sortOrder,
        salesStart: tier.salesStart ? new Date(tier.salesStart) : null,
        salesEnd: tier.salesEnd ? new Date(tier.salesEnd) : null,
        isActive: tier.isActive,
        isInfoOnly: tier.isInfoOnly,
    }
}

export async function GET() {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    try {
        const events = await prisma.event.findMany({
            orderBy: { startsAt: 'desc' },
            include: {
                ticketTypes: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
                _count: { select: { tickets: true } },
            },
        })
        return NextResponse.json(events)
    } catch (error) {
        console.error('Error fetching events:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    try {
        const parsed = EventSchema.safeParse(await req.json().catch(() => null))
        if (!parsed.success) {
            return NextResponse.json({ error: 'Datos del evento inválidos', details: parsed.error.flatten().fieldErrors }, { status: 400 })
        }
        const { id: _id, ticketTypes, ...data } = parsed.data

        const event = await prisma.event.create({
            data: {
                ...data,
                slug: await uniqueSlug(data.title),
                startsAt: new Date(data.startsAt),
                minAge: data.minAge ?? null,
                ticketTypes: {
                    create: ticketTypes.map(t => ({ ...tierData(t), capacity: t.capacity })),
                },
            },
        })
        return NextResponse.json(event)
    } catch (error) {
        console.error('Error creating event:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    try {
        const parsed = EventSchema.safeParse(await req.json().catch(() => null))
        if (!parsed.success || !parsed.data.id) {
            return NextResponse.json({ error: 'Datos del evento inválidos', details: parsed.success ? 'Falta ID' : parsed.error.flatten().fieldErrors }, { status: 400 })
        }
        const { id, ticketTypes, ...data } = parsed.data

        const existing = await prisma.event.findUnique({ where: { id }, include: { ticketTypes: true } })
        if (!existing) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
        if (existing.status === 'CANCELLED') {
            return NextResponse.json({ error: 'Un evento cancelado no se puede editar' }, { status: 409 })
        }

        const existingIds = new Set(existing.ticketTypes.map(t => t.id))
        const incomingIds = new Set(ticketTypes.filter(t => t.id).map(t => t.id!))

        const event = await prisma.$transaction(async (tx) => {
            for (const tier of ticketTypes) {
                if (tier.id && existingIds.has(tier.id)) {
                    // El cupo nunca puede quedar bajo lo ya vendido o apartado. Va en el mismo UPDATE
                    // para que una venta simultánea no se cuele entre la lectura y la escritura.
                    const updated = await tx.$executeRaw`
                        UPDATE "TicketType"
                        SET "capacity" = ${tier.capacity}
                        WHERE "id" = ${tier.id} AND "eventId" = ${id} AND "sold" + "reserved" <= ${tier.capacity}`
                    if (updated === 0) {
                        throw new ConflictError(`El cupo de "${tier.name}" no puede ser menor que las entradas ya vendidas o en proceso de compra.`)
                    }
                    await tx.ticketType.update({ where: { id: tier.id }, data: tierData(tier) })
                } else {
                    await tx.ticketType.create({ data: { ...tierData(tier), capacity: tier.capacity, eventId: id } })
                }
            }

            for (const old of existing.ticketTypes) {
                if (incomingIds.has(old.id)) continue
                const usedInOrders = await tx.ticketOrderItem.count({ where: { ticketTypeId: old.id } })
                if (usedInOrders > 0) {
                    throw new ConflictError(`El tramo "${old.name}" ya tiene compras asociadas: desactívalo en vez de borrarlo.`)
                }
                await tx.ticketType.delete({ where: { id: old.id } })
            }

            return tx.event.update({
                where: { id },
                data: { ...data, startsAt: new Date(data.startsAt), minAge: data.minAge ?? null },
            })
        })

        return NextResponse.json(event)
    } catch (error) {
        if (error instanceof ConflictError) {
            return NextResponse.json({ error: error.message }, { status: 409 })
        }
        console.error('Error updating event:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

// Cancelar un evento: corta la venta y anula las entradas. Los reembolsos se hacen en Mercado Pago.
export async function PATCH(req: Request) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    try {
        const parsed = z.object({ id: z.string().min(1).max(64), action: z.literal('cancel') }).safeParse(await req.json().catch(() => null))
        if (!parsed.success) return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })

        await cancelEvent(parsed.data.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error cancelling event:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const auth = await requireAdmin()
    if (auth.response) return auth.response

    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Falta el ID' }, { status: 400 })

    try {
        // Un evento con ventas es un registro contable: se cancela, no se borra
        const paidOrders = await prisma.ticketOrder.count({ where: { eventId: id, paymentId: { not: null } } })
        if (paidOrders > 0) {
            return NextResponse.json({ error: 'Este evento tiene ventas registradas. Cancélalo en vez de borrarlo.' }, { status: 409 })
        }
        await prisma.$transaction(async (tx) => {
            await tx.ticketOrder.deleteMany({ where: { eventId: id } })
            await tx.event.delete({ where: { id } })
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting event:', error)
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
    }
}
