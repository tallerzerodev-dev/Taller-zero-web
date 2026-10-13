'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isStaffEmail } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { admitTicket, TICKET_CODE_PATTERN, type EntryResult } from '@/lib/tickets'

export interface ScanOutcome {
  result: EntryResult
  kind: 'ticket' | 'invitation' | null
  name?: string
  detail?: string
  usedAt?: string
  usedBy?: string
}

export interface DoorStats {
  admitted: number
  total: number
}

export interface EntrySearchResult {
  code: string
  holderName: string
  buyerEmail: string
  tier: string
  folio: number
  status: string
}

const TIME_ZONE = 'America/Santiago'
const INVITATION_PATTERN = /^tz-vip-[a-f0-9]{8,32}$/

async function requireStaffEmail(): Promise<string> {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email || !isStaffEmail(email)) {
    throw new Error('No autorizado')
  }
  return email
}

// El QR contiene la URL completa de /scan/<código>; también se acepta el código pegado a mano
function extractCode(raw: string): string {
  const match = raw.trim().slice(0, 300).match(/tz-(?:tk|vip)-[a-f0-9]{8,32}/)
  return match ? match[0] : ''
}

const formatTime = (date: Date | null | undefined) => date?.toLocaleString('es-CL', { timeZone: TIME_ZONE })

// En la puerta, escanear ES confirmar: marca el ingreso de inmediato y devuelve el veredicto.
export async function scanEntry(raw: string, eventId: string): Promise<ScanOutcome> {
  const staffEmail = await requireStaffEmail()
  const code = extractCode(raw)

  if (TICKET_CODE_PATTERN.test(code)) {
    const { result, ticket } = await admitTicket(code, staffEmail, eventId)
    if (!ticket) return { result, kind: null }
    return {
      result,
      kind: 'ticket',
      name: ticket.holderName,
      detail: result === 'WRONG_EVENT'
        ? `Esta entrada es para: ${ticket.event.title}`
        : `${ticket.ticketType.name} · Folio ${String(ticket.folio).padStart(4, '0')}`,
      usedAt: formatTime(ticket.usedAt),
      usedBy: ticket.usedBy ?? undefined,
    }
  }

  if (INVITATION_PATTERN.test(code)) {
    // Atómico: si dos personas escanean a la vez, solo una encuentra la invitación sin usar
    const updated = await prisma.invitation.updateMany({
      where: { token: code, isScanned: false },
      data: { isScanned: true, scannedAt: new Date() },
    })
    const invitation = await prisma.invitation.findUnique({ where: { token: code } })
    if (!invitation) return { result: 'NOT_FOUND', kind: null }
    return {
      result: updated.count === 1 ? 'OK' : 'ALREADY_USED',
      kind: 'invitation',
      name: invitation.guestName,
      detail: invitation.type === 'WINNER' ? 'Ganador de concurso' : 'Invitado VIP',
      usedAt: formatTime(invitation.scannedAt),
    }
  }

  return { result: 'NOT_FOUND', kind: null }
}

export async function getDoorStats(eventId: string): Promise<DoorStats> {
  await requireStaffEmail()
  const [admitted, total] = await Promise.all([
    prisma.ticket.count({ where: { eventId, status: 'USED' } }),
    prisma.ticket.count({ where: { eventId, status: { in: ['VALID', 'USED'] } } }),
  ])
  return { admitted, total }
}

// Para quien llega sin el QR a mano: buscar por nombre o correo del comprador
export async function searchEntries(eventId: string, query: string): Promise<EntrySearchResult[]> {
  await requireStaffEmail()
  const term = query.trim().slice(0, 100)
  if (term.length < 3) return []

  const tickets = await prisma.ticket.findMany({
    where: {
      eventId,
      OR: [
        { holderName: { contains: term, mode: 'insensitive' } },
        { order: { buyerEmail: { contains: term, mode: 'insensitive' } } },
      ],
    },
    include: { ticketType: { select: { name: true } }, order: { select: { buyerEmail: true } } },
    orderBy: { folio: 'asc' },
    take: 30,
  })

  return tickets.map(t => ({
    code: t.code,
    holderName: t.holderName,
    buyerEmail: t.order.buyerEmail,
    tier: t.ticketType.name,
    folio: t.folio,
    status: t.status,
  }))
}
