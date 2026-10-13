import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { FadeIn, StaggerContainer } from '@/components/ui/Animations'
import { formatEventDate, formatEventTime, formatCLP } from '@/lib/dates'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Eventos | Entradas Taller Zero',
  description: 'Próximos eventos de Taller Zero. Compra tus entradas directo en el sitio.',
  alternates: { canonical: 'https://taller-zero.cl/eventos' },
}

// Un evento sigue listado hasta unas horas después de empezar
const LISTING_GRACE_MS = 8 * 60 * 60 * 1000

export default async function EventosPage() {
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED', startsAt: { gte: new Date(Date.now() - LISTING_GRACE_MS) } },
    orderBy: { startsAt: 'asc' },
    include: { ticketTypes: { where: { isActive: true }, select: { price: true, isInfoOnly: true } } },
  })

  return (
    <main className="flex-1 flex flex-col bg-black min-h-screen pt-32 pb-24">
      <section className="px-6 w-full max-w-[1400px] mx-auto mb-16">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#333] pb-8">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-white leading-none">EVENTOS</h1>
              <p className="font-mono text-xs uppercase tracking-[0.3em] font-bold text-[#888] mt-4">PRÓXIMAS FECHAS Y ENTRADAS</p>
            </div>
            <div className="font-mono text-xs text-[#555] uppercase tracking-widest text-left md:text-right">
              EN CARTELERA: {events.length}
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="px-6 w-full max-w-[1400px] mx-auto">
        {events.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => {
              const prices = event.ticketTypes.filter(t => !t.isInfoOnly).map(t => t.price)
              return (
                <FadeIn key={event.id}>
                  <Link href={`/eventos/${event.slug}`} className="group block h-full focus:outline-none">
                    <div className="border border-[#333] bg-[#0a0a0a] group-hover:border-white transition-colors duration-500 flex flex-col h-full p-1 pb-6">
                      <div className="flex justify-between items-center p-3 font-mono text-xs uppercase tracking-widest">
                        <span className="bg-white text-black font-bold px-2 py-0.5">{formatEventDate(event.startsAt)}</span>
                        <span className="text-[#888]">{formatEventTime(event.startsAt)} HRS</span>
                      </div>
                      <div className="w-full aspect-[4/5] bg-black overflow-hidden relative mb-6">
                        {event.coverImage ? (
                          <Image
                            src={event.coverImage}
                            alt={event.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#111] font-mono text-xs uppercase text-[#555]">Sin portada</div>
                        )}
                      </div>
                      <div className="px-4 flex-1 flex flex-col justify-end">
                        <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tighter text-white mb-2 leading-none group-hover:underline underline-offset-4">{event.title}</h2>
                        <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest border-t border-[#333] pt-3 mt-1 flex justify-between gap-4">
                          <span className="line-clamp-1">{event.venueName}</span>
                          {prices.length > 0 && <span className="text-white whitespace-nowrap">DESDE {formatCLP(Math.min(...prices))}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              )
            })}
          </StaggerContainer>
        ) : (
          <FadeIn>
            <div className="w-full py-32 border border-[#333] border-dashed flex flex-col items-center justify-center text-center">
              <span className="font-mono text-xl uppercase tracking-widest text-[#555] mb-2">SIN FECHAS ANUNCIADAS</span>
              <p className="font-mono text-xs text-[#333] uppercase">Pronto habrá novedades.</p>
            </div>
          </FadeIn>
        )}
      </section>
    </main>
  )
}
