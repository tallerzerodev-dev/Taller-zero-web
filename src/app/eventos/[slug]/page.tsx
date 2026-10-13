import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'
import { FadeIn } from '@/components/ui/Animations'
import { TicketSelector } from '@/components/tickets/TicketSelector'
import { releaseExpiredReservations, toTierView } from '@/lib/tickets'
import { formatEventDate, formatEventDateTime } from '@/lib/dates'

export const dynamic = 'force-dynamic'

// generateMetadata y la página piden el mismo evento: cache() evita la segunda consulta
const getEvent = cache((slug: string) =>
  prisma.event.findUnique({ where: { slug }, select: { id: true, slug: true, title: true, description: true, startsAt: true, venueName: true, venueAddress: true, coverImage: true, lineup: true, tags: true, minAge: true, maxPerOrder: true, status: true } })
)

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await getEvent(params.slug)
  if (!event || event.status === 'DRAFT') return { title: 'Evento no encontrado' }

  const description = `${event.title} — ${formatEventDate(event.startsAt)} en ${event.venueName}. Entradas en Taller Zero.`
  return {
    title: `${event.title} | Entradas`,
    description,
    alternates: { canonical: `${SITE_URL}/eventos/${event.slug}` },
    openGraph: { title: event.title, description, images: event.coverImage ? [{ url: event.coverImage }] : undefined },
  }
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  const event = await getEvent(params.slug)
  if (!event || event.status === 'DRAFT') notFound()

  // Antes de mostrar disponibilidad se devuelve el cupo de compras que no se pagaron
  await releaseExpiredReservations(event.id)
  const ticketTypes = await prisma.ticketType.findMany({
    where: { eventId: event.id, OR: [{ isActive: true }, { sold: { gt: 0 } }] },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
  const now = new Date()
  const tiers = ticketTypes.map(t => toTierView(t, event, now))
  const isCancelled = event.status === 'CANCELLED'

  return (
    <main className="flex-1 flex flex-col bg-black min-h-screen pt-24 pb-32">
      <section className="px-6 w-full max-w-[1400px] mx-auto">
        <FadeIn y={20}>
          <Link href="/eventos" className="font-mono text-xs uppercase tracking-[0.2em] text-[#888] hover:text-white mb-8 flex items-center gap-2 border border-[#333] px-3 py-1.5 w-fit hover:border-white transition-colors">
            ← Volver a Eventos
          </Link>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Información */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <FadeIn y={20}>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold uppercase tracking-tighter text-white leading-none mb-6">{event.title}</h1>

              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {event.tags.map(tag => (
                    <span key={tag} className="font-mono text-[10px] uppercase tracking-widest border border-[#333] text-[#888] px-2 py-1">#{tag}</span>
                  ))}
                </div>
              )}

              <div className="font-mono text-sm uppercase tracking-widest border-y border-[#333] py-6 mb-10 space-y-2">
                <p className="text-white">{formatEventDateTime(event.startsAt)}</p>
                <p className="text-[#888]">{[event.venueName, event.venueAddress].filter(Boolean).join(' — ')}</p>
                {event.minAge ? <p className="text-[#888]">Evento para mayores de {event.minAge} años</p> : null}
              </div>
            </FadeIn>

            {isCancelled && (
              <div className="border-2 border-red-600 bg-[#1a0000] p-6 mb-10">
                <p className="font-mono text-sm uppercase tracking-widest text-red-500 font-bold">EVENTO CANCELADO</p>
                <p className="font-mono text-xs uppercase tracking-widest text-[#888] mt-2">Si compraste entradas, te contactaremos por correo para la devolución.</p>
              </div>
            )}

            {event.description && (
              <FadeIn>
                <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-4">Acerca del evento</h2>
                <p className="font-mono text-sm text-[#aaa] leading-relaxed whitespace-pre-line mb-12">{event.description}</p>
              </FadeIn>
            )}

            {event.lineup.length > 0 && (
              <FadeIn>
                <div className="flex justify-between items-end border-b border-[#333] pb-4 mb-4">
                  <h2 className="text-xl font-bold uppercase tracking-widest text-white">Lineup</h2>
                  <span className="font-mono text-xs text-[#555]">{event.lineup.length} ARTISTAS</span>
                </div>
                <ul className="mb-12">
                  {event.lineup.map((artist, index) => (
                    <li key={artist} className="flex items-center gap-4 border-b border-[#222] py-4">
                      <span className="font-mono text-[10px] text-[#555] tracking-widest">{String(index + 1).padStart(2, '0')}</span>
                      <span className="text-2xl font-bold uppercase tracking-tight text-white">{artist}</span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            )}

            {!isCancelled && tiers.length > 0 && (
              <FadeIn>
                <div id="tickets" className="scroll-mt-28">
                  <TicketSelector slug={event.slug} tiers={tiers} maxPerOrder={event.maxPerOrder} />
                </div>
              </FadeIn>
            )}
          </div>

          {/* Portada */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <FadeIn delay={0.2}>
              <div className="lg:sticky lg:top-28">
                <div className="w-full aspect-[4/5] relative bg-[#0a0a0a] border border-[#333] overflow-hidden">
                  {event.coverImage ? (
                    <Image src={event.coverImage} alt={event.title} fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase text-[#555]">Sin portada</div>
                  )}
                </div>
                {!isCancelled && tiers.length > 0 && (
                  <a href="#tickets" className="brutalist-button !w-full text-center block mt-4">VER TICKETS</a>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </main>
  )
}
