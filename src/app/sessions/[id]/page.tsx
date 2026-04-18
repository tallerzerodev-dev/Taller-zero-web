import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FadeIn, StaggerContainer } from '@/components/ui/Animations'
import { prisma } from '@/lib/prisma'
import { TrailerVideo } from '@/components/ui/TrailerVideo'
import { ParticleBackground } from '@/components/ui/ParticleBackground'
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const session = await prisma.session.findUnique({
        where: { id: params.id },
        include: { artists: true }
    })

    if (!session) return { title: 'Sesión No Encontrada' }

    const artistNames = session.artists.map((a: any) => a.name).join(', ')
    const desc = `Live set RAW de ${session.title}. Featuring: ${artistNames}. Formato original desde Taller Zero.`

    return {
        title: `${session.title} | Taller Zero`,
        description: `Live set RAW de ${session.title}. Featuring: ${artistNames}. Sesión de techno, hypnotic techno y música underground desde Chile grabada en formato RAW por Taller Zero.`,
        keywords: [
          ...session.artists.map((a: any) => a.name),
          session.title,
          // Nacional
          'techno Chile', 'dj set Chile', 'sesiones techno Chile', 'djs chilenos',
          'hardgroove Chile', 'hypnotic techno Chile', 'underground Chile', 'Taller Zero',
          'sets en vivo Chile', 'música electrónica Chile', 'artistas locales techno',
          // Internacional
          'techno', 'dj set', 'live set techno', 'underground techno', 'hypnotic techno',
          'hardgroove', 'hardhouse', 'raw techno', 'industrial techno', 'techno sessions',
          'electronic music', 'groove techno', 'techno live', 'bounce techno', 'dark techno'
        ],
        alternates: { canonical: `https://taller-zero.cl/sessions/${session.id}` },
        openGraph: {
            title: `${session.title} | Taller Zero`,
            description: `Live set RAW de ${session.title}. Featuring: ${artistNames}. Formato original desde Taller Zero.`,
            images: session.gifUrl ? [{ url: session.gifUrl }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: session.title,
            description: `Live set RAW de ${session.title}. Featuring: ${artistNames}.`,
            images: session.gifUrl ? [session.gifUrl] : undefined,
        }
    }
}

export default async function SessionPage({ params }: { params: { id: string } }) {
    const session = await prisma.session.findUnique({
        where: { id: params.id },
        include: { artists: true }
    })

    if (!session) {
        return (
            <main className="flex-1 flex flex-col bg-black min-h-screen pt-48 items-center">
                <FadeIn y={20}>
                    <h1 className="text-4xl text-white font-bold uppercase tracking-tighter mb-4">Sesi&oacute;n No Encontrada</h1>
                    <Link href="/sessions" className="brutalist-button">Volver</Link>
                </FadeIn>
            </main>
        )
    }

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen pt-24 pb-32">
            <section className="px-6 w-full max-w-[1400px] mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#333] pb-8 gap-8">
                <FadeIn y={20}>
                    <Link href="/sessions" className="font-mono text-xs uppercase tracking-[0.2em] text-[#888] hover:text-white mb-6 flex items-center gap-2 border border-[#333] px-3 py-1.5 w-fit hover:border-white transition-colors">
                        ← Volver a Sesiones
                    </Link>
                    <div>
                        <span className="text-xs font-mono uppercase tracking-[0.3em] font-bold bg-white text-black px-2 py-1 mb-4 inline-block">
                            REGISTRO #{session.sessionNumber}
                        </span>
                        <h1 className="text-5xl lg:text-7xl font-bold uppercase tracking-tighter text-white leading-none mt-4">
                            {session.title}
                        </h1>
                    </div>
                </FadeIn>
                <FadeIn delay={0.2}>
                    <div className="flex flex-col items-start md:items-end text-left md:text-right font-mono uppercase tracking-widest text-[#888] text-sm">
                        <span className="text-white font-bold mb-2">FECHA</span>
                        <span>{session.dateText}</span>
                    </div>
                </FadeIn>
            </section>

            <section className="px-6 w-full max-w-[1400px] mx-auto mb-20">
                <FadeIn delay={0.3}>
                    <div className="w-full aspect-video bg-[#0a0a0a] border border-[#333] relative flex items-center justify-center overflow-hidden group hover:border-white transition-colors duration-500">
                        {session.trailerUrl ? (
                            session.trailerUrl.includes('youtube.com') || session.trailerUrl.includes('youtu.be') ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${session.trailerUrl.includes('youtu.be') ? session.trailerUrl.split('/').pop()?.split('?')[0] : (session.trailerUrl.includes('v=') ? new URLSearchParams(session.trailerUrl.split('?')[1]).get('v') : session.trailerUrl.split('/').pop())}?autoplay=1&mute=1&controls=0&rel=0&showinfo=0`}
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                    className="absolute inset-0 w-full h-full object-cover border-0"
                                ></iframe>
                            ) : (
                                <TrailerVideo src={session.trailerUrl} />
                            )
                        ) : (
                            <div className="text-[#333] font-mono text-sm uppercase tracking-widest">
                                TRAILER NO DISPONIBLE
                            </div>
                        )}
                    </div>
                </FadeIn>
            </section>

            <section className="px-6 w-full max-w-[1400px] mx-auto mb-24">
                <div className="flex justify-between items-end border-b border-[#333] pb-4 mb-8">
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-white">Lineup</h2>
                    <span className="font-mono text-xs text-[#555]">{(session.artists || []).length} ARTISTAS</span>
                </div>

                {session.artists && session.artists.length > 0 ? (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {session.artists.map((artist: any, idx: number) => (
                            <FadeIn key={artist.id}>
                                <Link href={`/sessions/${session.id}/artist/${artist.id}`} className="group block w-full focus:outline-none active:scale-[0.98] transition-transform duration-300 ease-out h-full">
                                    <div className="w-full h-[500px] md:h-[600px] relative bg-black border border-[#333] group-hover:border-[#777] transition-all duration-700 overflow-hidden rounded-sm">
                                        
                                        {/* BACKGROUND IMAGE */}
                                        <div className="absolute inset-0 z-0 transition-transform duration-[2000ms] group-hover:scale-105">
                                            {artist.photo ? (
                                                <Image src={artist.photo} alt={artist.name} fill className="object-cover object-[center_top] grayscale-[0.5] mix-blend-luminosity group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-700" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-[#111]"><span className="font-mono text-xs uppercase text-[#555]">No Photo</span></div>
                                            )}
                                        </div>
                                        
                                        {/* GRADIENT OVERLAYS */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 z-10"></div>
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none"></div>

                                        {/* PARTICLES */}
                                        <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-1000">
                                            <ParticleBackground />
                                        </div>

                                        {/* CONTENT */}
                                        <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 md:p-8">
                                            {/* Top info */}
                                            <div className="flex justify-between items-start w-full">
                                                <span className="font-mono text-[10px] bg-white text-black px-2 py-0.5 uppercase tracking-widest font-bold shadow-lg">ARTISTA 0{idx + 1}</span>
                                                <div className="font-mono text-[10px] text-white border border-white/30 backdrop-blur-md bg-black/30 px-3 py-1 uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-colors">
                                                    ► LIVE SET
                                                </div>
                                            </div>

                                            {/* Bottom Name */}
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                <span className="font-mono text-[10px] text-[#aaa] uppercase tracking-[0.2em] mb-2 block group-hover:text-white transition-colors">TALLER ZERO // {session.sessionNumber || 'S00'}</span>
                                                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-white leading-[0.9] drop-shadow-2xl">
                                                    {artist.name}
                                                </h3>
                                            </div>
                                        </div>

                                    </div>
                                </Link>
                            </FadeIn>
                        ))}
                    </StaggerContainer>
                ) : (
                    <p className="text-gray-500 font-mono uppercase text-sm">NO HAY ARTISTAS ASIGNADOS A ESTA SESIÓN</p>
                )}
            </section>

            <section className="px-6 w-full max-w-[1400px] mx-auto">
                <FadeIn>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-[#333] pt-12">
                        <div className="md:col-span-4">
                            <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2">Información del Registro</h2>
                            <p className="font-mono text-[#555] text-xs uppercase tracking-widest mb-8">Metadata Taller Zero</p>

                            {session.showLeftColInfo && (
                                <div className="space-y-4 font-mono text-xs text-[#888] uppercase tracking-widest border-l border-[#333] pl-4">
                                    {session.leftColLine1 && <p>{session.leftColLine1}</p>}
                                    {session.leftColLine2 && <p>{session.leftColLine2}</p>}
                                    {session.leftColLine3 && <p className="text-white">{session.leftColLine3}</p>}
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-8">
                            <div className="font-mono text-sm text-[#aaa] leading-relaxed">
                                <p className="whitespace-pre-line">{session.spinup || 'Sección de información sin texto...'}</p>
                            </div>
                        </div>
                    </div>
                </FadeIn>
            </section>
        </main>
    )
}