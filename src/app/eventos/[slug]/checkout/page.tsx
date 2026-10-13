import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TicketCheckout } from '@/components/tickets/TicketCheckout'
import { getTierState } from '@/lib/tickets'
import { formatEventDateTime } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Comprar entradas',
  robots: { index: false, follow: false },
}

// La selección llega como ?sel=<idTramo>:<cantidad>,<idTramo>:<cantidad>. Es solo una propuesta:
// aquí se descarta lo que no cuadre y el cobro real se recalcula en /api/tickets/checkout.
function parseSelection(raw: string | undefined): Map<string, number> {
  const selection = new Map<string, number>()
  for (const part of (raw || '').split(',').slice(0, 12)) {
    const [id, quantity] = part.split(':')
    const parsed = Number(quantity)
    if (id && Number.isInteger(parsed) && parsed > 0 && parsed <= 20) selection.set(id, parsed)
  }
  return selection
}

export default async function TicketCheckoutPage({ params, searchParams }: { params: { slug: string }; searchParams: { sel?: string } }) {
  const event = await prisma.event.findUnique({
    where: { slug: params.slug },
    include: { ticketTypes: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] } },
  })
  if (!event || event.status !== 'PUBLISHED') notFound()

  const selection = parseSelection(searchParams.sel)
  const now = new Date()
  const lines = event.ticketTypes
    .filter(t => selection.has(t.id) && getTierState(t, event.startsAt, now) === 'AVAILABLE')
    .map(t => ({ ticketTypeId: t.id, name: t.name, price: t.price, quantity: selection.get(t.id)! }))

  const totalQuantity = lines.reduce((acc, l) => acc + l.quantity, 0)
  if (lines.length === 0 || totalQuantity > event.maxPerOrder) {
    redirect(`/eventos/${event.slug}#tickets`)
  }

  return (
    <main className="flex-1 flex justify-center bg-black min-h-screen px-4 py-10 md:px-6 md:py-24">
      <TicketCheckout
        slug={event.slug}
        eventTitle={event.title}
        eventSubtitle={`${formatEventDateTime(event.startsAt)} — ${event.venueName}`}
        lines={lines}
      />
    </main>
  )
}
