import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import QRCode from 'qrcode'
import { prisma } from '@/lib/prisma'
import { getSiteUrl } from '@/lib/mercadopago'
import { formatEventDateTime, formatCLP } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mis entradas',
  robots: { index: false, follow: false },
}

const TICKET_STATUS: Record<string, { label: string; className: string }> = {
  VALID: { label: 'VÁLIDA', className: 'border-[#4ade80] text-[#4ade80]' },
  USED: { label: 'YA UTILIZADA', className: 'border-[#555] text-[#888]' },
  CANCELLED: { label: 'ANULADA', className: 'border-red-600 text-red-500' },
}

export default async function EntradasPage({ params }: { params: { token: string } }) {
  if (!/^[a-f0-9]{32}$/.test(params.token)) notFound()

  const order = await prisma.ticketOrder.findUnique({
    where: { accessToken: params.token },
    include: {
      event: true,
      tickets: { include: { ticketType: { select: { name: true } } }, orderBy: { folio: 'asc' } },
    },
  })
  // Solo una orden con entradas emitidas tiene algo que mostrar
  if (!order || order.tickets.length === 0) notFound()

  const siteUrl = getSiteUrl()
  const tickets = await Promise.all(
    order.tickets.map(async ticket => ({
      ...ticket,
      // El QR solo contiene el enlace de validación: sin nombre, correo ni datos de la compra
      qr: ticket.status === 'VALID'
        ? await QRCode.toDataURL(`${siteUrl}/scan/${ticket.code}`, { width: 440, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
        : null,
    }))
  )

  const orderNumber = order.id.slice(-6).toUpperCase()

  return (
    <main className="flex-1 flex flex-col bg-black min-h-screen pt-28 pb-24 px-4">
      <div className="w-full max-w-3xl mx-auto">
        <header className="border-b border-[#333] pb-8 mb-8">
          <p className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em] mb-4">TUS ENTRADAS {'///'} ORDEN #{orderNumber}</p>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white leading-none mb-6">{order.event.title}</h1>
          <div className="font-mono text-sm uppercase tracking-widest space-y-2">
            <p className="text-white">{formatEventDateTime(order.event.startsAt)}</p>
            <p className="text-[#888]">{[order.event.venueName, order.event.venueAddress].filter(Boolean).join(' — ')}</p>
            {order.event.minAge ? <p className="text-[#888]">Evento para mayores de {order.event.minAge} años</p> : null}
          </div>
        </header>

        {order.event.status === 'CANCELLED' && (
          <div className="border-2 border-red-600 bg-[#1a0000] p-6 mb-8">
            <p className="font-mono text-sm uppercase tracking-widest text-red-500 font-bold">EVENTO CANCELADO</p>
            <p className="font-mono text-xs uppercase tracking-widest text-[#888] mt-2">Te contactaremos por correo para la devolución.</p>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-4 font-mono text-xs uppercase tracking-widest border border-[#222] bg-[#0a0a0a] p-4 mb-8">
          <div>
            <dt className="text-[#555] mb-1">Comprador</dt>
            <dd className="text-white">{order.buyerName}</dd>
          </div>
          <div className="text-right">
            <dt className="text-[#555] mb-1">Total pagado</dt>
            <dd className="text-white">{formatCLP(order.totalAmount)}</dd>
          </div>
        </dl>

        <ul className="flex flex-col gap-6">
          {tickets.map((ticket, index) => {
            const status = TICKET_STATUS[ticket.status] ?? TICKET_STATUS.CANCELLED
            return (
              <li key={ticket.id} className="border border-[#333] bg-[#050505] p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-[220px] h-[220px] shrink-0 bg-white flex items-center justify-center">
                  {ticket.qr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ticket.qr} alt={`Código QR de la entrada ${index + 1}`} width={220} height={220} />
                  ) : (
                    <span className="font-mono text-xs uppercase tracking-widest text-black font-bold text-center px-4">{status.label}</span>
                  )}
                </div>
                <div className="font-mono uppercase tracking-widest text-center sm:text-left">
                  <p className="text-[10px] text-[#555] mb-2">ENTRADA {index + 1} DE {tickets.length} {'///'} FOLIO {String(ticket.folio).padStart(4, '0')}</p>
                  <p className="text-2xl font-bold text-white mb-4">{ticket.ticketType.name}</p>
                  <span className={`text-[10px] border px-2 py-1 inline-block ${status.className}`}>{status.label}</span>
                </div>
              </li>
            )
          })}
        </ul>

        <p className="font-mono text-[10px] text-[#555] uppercase tracking-widest text-center mt-10 leading-relaxed">
          CADA QR SIRVE PARA UN SOLO INGRESO. QUIEN TENGA ESTE ENLACE PUEDE USAR LAS ENTRADAS: NO LO PUBLIQUES.
        </p>
        <div className="text-center mt-8">
          <Link href="/eventos" className="font-mono text-[10px] uppercase tracking-[0.3em] border border-[#333] text-[#888] hover:bg-white hover:text-black hover:border-white transition-colors px-6 py-3 inline-block">
            VER MÁS EVENTOS
          </Link>
        </div>
      </div>
    </main>
  )
}
