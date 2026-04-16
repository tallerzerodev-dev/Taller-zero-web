import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FadeIn, StaggerContainer } from '@/components/ui/Animations'
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const sessions = await prisma.session.findMany({ include: { artists: true } })
  const allArtists = new Set<string>()
  sessions.forEach((s: any) => s.artists.forEach((a: any) => allArtists.add(a.name)))

  return {
    title: 'Archivo | Sesiones en Vivo',
    description: 'Explora todo el archivo visual de Taller Zero. Sets RAW, Techno y artistas underground.',
    keywords: Array.from(allArtists).concat(['techno', 'live set', 'sesiones', 'bounce', 'underground']),
  }
}

export default async function SessionsPage() {
  let sessions = await prisma.session.findMany({
    include: { artists: true }
  })
  // Ordenar por sessionNumber numérico descendente (más reciente primero)
  sessions = sessions.sort((a, b) => {
    const numA = parseInt((a.sessionNumber || '').replace(/\D/g, ''), 10) || 0;
    const numB = parseInt((b.sessionNumber || '').replace(/\D/g, ''), 10) || 0;
    return numB - numA;
  });

  return (
    <main className="flex-1 flex flex-col bg-black min-h-screen pt-32 pb-24">
      {/* HEADER */}
      <section className="px-6 w-full max-w-[1400px] mx-auto mb-16">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#333] pb-8">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-white leading-none">
                ARCHIVO
              </h1>
              <p className="font-mono text-xs uppercase tracking-[0.3em] font-bold text-[#888] mt-4">
                TODOS LOS REGISTROS VISUALES
              </p>
            </div>
            <div className="font-mono text-xs text-[#555] uppercase tracking-widest text-left md:text-right">
              TOTAL SESIONES: {sessions.length} <br />
              FORMATO: <span className="text-white">RAW</span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* SESSIONS GRID */}
      <section className="px-6 w-full max-w-[1400px] mx-auto">
        {sessions.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sessions.map((session: any, idx: number) => (
              <FadeIn key={session.id}>
                <Link
                  href={`/sessions/${session.id}`}
                  className="group block h-full focus:outline-none"
                >
                  <div className="border border-[#333] bg-[#0a0a0a] group-hover:border-white transition-colors duration-500 overflow-hidden flex flex-col h-full relative p-1 pb-6">
                    {/* ENCABEZADO CARTA */}
                    <div className="flex justify-between items-center p-3 font-mono text-xs uppercase tracking-widest z-10 relative">
                      <span className="bg-white text-black font-bold px-2 py-0.5">
                        #{session.sessionNumber}
                      </span>
                      <span className="text-[#888]">
                        {session.dateText}
                      </span>
                    </div>

                    {/* IMAGEN DESTACADA */}
                    <div className="w-full aspect-[4/3] bg-black overflow-hidden relative mb-6">
                      {(() => {
                        const bgUrl = session.gifUrl || '/placeholder.jpg';
                        const isVideo = bgUrl.toLowerCase().endsWith('.mp4') || bgUrl.toLowerCase().endsWith('.webm') || bgUrl.toLowerCase().endsWith('.mov');
                        return isVideo ? (
                          <video src={bgUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000 z-0" />
                        ) : (
                          <div className="absolute inset-0 bg-cover bg-center grayscale mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000 z-0"
                            style={{ backgroundImage: `url(${bgUrl})` }}></div>
                        );
                      })()}
                      <div className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full border border-white/50 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>

                    {/* INFORMACIÓN SESIÓN */}
                    <div className="px-4 flex-1 flex flex-col justify-end">
                      <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tighter text-white mb-2 leading-none group-hover:underline underline-offset-4 overflow-hidden text-ellipsis whitespace-nowrap">
                        {session.title}
                      </h2>
                      <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest line-clamp-1 border-t border-[#333] pt-3 mt-1">
                        ARTISTAS: {session.artists?.map((a: any) => a.name).join(' + ') || 'N/A'}
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </StaggerContainer>
        ) : (
          <FadeIn>
            <div className="w-full py-32 border border-[#333] border-dashed flex flex-col items-center justify-center text-center">
              <span className="font-mono text-xl uppercase tracking-widest text-[#555] mb-2">LA BASE DE DATOS ESTÁ VACÍA</span>
              <p className="font-mono text-xs text-[#333] uppercase">No se ha creado ninguna sesión todavía.</p>
            </div>
          </FadeIn>
        )}
      </section>
    </main>
  )
}
