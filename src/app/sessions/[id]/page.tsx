import type { Metadata } from 'next'
import Link from 'next/link'
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
        title: `${session.title}`,
        description: desc,
        keywords: [session.title, 'Live Set', 'Sesiones en Vivo', ...session.artists.map((a: any) => a.name), 'Taller Zero', 'techno'],
        openGraph: {
            title: `${session.title} | Taller Zero`,
            description: desc,
            images: session.gifUrl ? [{ url: session.gifUrl }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: session.title,
            description: desc,
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
                    <StaggerContainer className="flex flex-col gap-12">
                        {session.artists.map((artist: any, idx: number) => (
                            <FadeIn key={artist.id}>
                                <Link href={`/sessions/${session.id}/artist/${artist.id}`} className="group block w-full focus:outline-none active:scale-[0.98] transition-transform duration-200 ease-out">
                                    <div className="w-full flex flex-col md:flex-row relative bg-black border border-[#333] group-hover:border-white transition-colors duration-700 overflow-hidden">

                                        {/* FONDO GENERATIVO ANIMADO (Repulsión por Mouse) */}
                                        <div className="absolute inset-0 z-0 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-[2000ms] flex items-center justify-center overflow-hidden">
                                            <ParticleBackground />
                                        </div>

                                        {/* COLUMNA 1: INFO Y TRACKING (Panel Izquierdo IG) */}
                                        <div className="hidden md:flex flex-1 border-r border-[#333] z-10 flex-col justify-end p-8 relative">
                                            <div className="absolute top-4 left-4 font-mono text-[10px] text-[#555] uppercase border border-[#333] px-2 py-0.5">
                                                TALLER ZERO // {session.sessionNumber || 'S00'}
                                            </div>
                                            <span className="font-mono text-xs text-[#555] uppercase tracking-widest">Alineación</span>
                                            <h4 className="text-xl font-bold uppercase tracking-wider text-[#888] mt-1 group-hover:text-[#ff3333] transition-colors">{session.title}</h4>
                                        </div>

                                        {/* COLUMNA 2: FOTO DEL ARTISTA (Panel Central IG) */}
                                        <div className="w-full md:w-[450px] lg:w-[600px] shrink-0 aspect-[4/5] relative z-10 border-r border-[#333] bg-[#0a0a0a] group-hover:scale-[1.02] transition-transform duration-[1500ms]">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-10 pointer-events-none"></div>
                                            {artist.photo ? (
                                                <div className="absolute inset-0 bg-cover bg-center grayscale mix-blend-luminosity group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-[1500ms] z-0" style={{ backgroundImage: `url(${artist.photo})` }}></div>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center grayscale opacity-10 bg-[#111] z-0"><span className="font-mono text-xs uppercase">No Photo</span></div>
                                            )}
                                            {/* Indicador superior como en posts de Instagram */}
                                            <div className="absolute top-4 right-4 z-20 w-4 h-4 border-2 border-white rounded-sm opactiy-80"></div>
                                        </div>

                                        {/* COLUMNA 3: ACCIONAMIENTO (Panel Derecho IG) */}
                                        <div className="flex-1 flex flex-col justify-center sm:justify-between items-center sm:items-end text-center sm:text-right p-8 z-10 h-64 sm:h-auto">
                                            <div className="font-mono text-[10px] text-white border border-[#555] group-hover:border-white px-4 py-2 uppercase tracking-widest bg-black/50 backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all mb-4 sm:mb-0">
                                                ► VER LIVE SET
                                            </div>
                                            <div className="flex flex-col items-center sm:items-end">
                                                <span className="font-mono text-[10px] bg-white text-black px-2 py-0.5 uppercase tracking-widest font-bold mb-2 inline-block">ARTISTA 0{idx + 1}</span>
                                                <h3 className="max-w-full text-[clamp(2.5rem,8vw,4rem)] lg:text-[5rem] text-right font-bold uppercase tracking-tighter text-white leading-[0.85] break-words">
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