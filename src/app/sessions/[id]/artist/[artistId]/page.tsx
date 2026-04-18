import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/Animations'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string, artistId: string } }): Promise<Metadata> {
    const artist = await prisma.artist.findFirst({
        where: { id: params.artistId, sessionId: params.id },
        include: { session: true }
    })
    if (!artist) return { title: 'Artista No Encontrado' }

    const desc = artist.bio || `Live set de ${artist.name} en ${(artist as any).session.title}. Registros visuales Taller Zero.`

    return {
        title: `${artist.name} | ${(artist as any).session.title} | Taller Zero`,
        description: desc,
        keywords: [
            artist.name,
            (artist as any).session.title,
            // Nacional
            'techno Chile', 'dj set Chile', 'djs chilenos', 'hardgroove Chile',
            'hypnotic techno Chile', 'underground Chile', 'Taller Zero', 'sesiones techno Chile',
            'música electrónica Chile', 'artistas locales techno', 'djs techno chilenos',
            // Internacional
            'techno', 'dj set', 'live set', 'live set techno', 'underground techno',
            'hypnotic techno', 'hardgroove', 'hardhouse', 'raw techno', 'industrial techno',
            'techno sessions', 'electronic music', 'groove techno', 'techno live', 'dj techno'
        ],
        alternates: { canonical: `https://taller-zero.cl/sessions/${params.id}/artist/${params.artistId}` },
        openGraph: {
            title: `${artist.name} | Live Set en Taller Zero`,
            description: desc,
            images: ((artist as any).profilePhoto || artist.photo) ? [{ url: (artist as any).profilePhoto || artist.photo || '' }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: artist.name,
            description: desc,
            images: ((artist as any).profilePhoto || artist.photo) ? [(artist as any).profilePhoto || artist.photo || ''] : undefined,
        }
    }
}

function getEmbedUrl(url: string) {
    if (!url) return '';

    // Si el usuario pegó el <iframe> completo, extraer solo el enlace del src=""
    const iframeMatch = url.match(/src="([^"]+)"/);
    if (url.includes('<iframe') && iframeMatch) {
        return iframeMatch[1];
    }

    if (url.includes('youtube.com/embed/')) return url; // ya es un enlace embed directo
    let videoId = '';
    if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('v=')) {
        videoId = new URLSearchParams(url.split('?')[1]).get('v') || '';
    } else {
        videoId = url.split('/').pop() || '';
    }
    return `https://www.youtube.com/embed/${videoId}`;
}

export default async function ArtistDetailPage({ params }: { params: { id: string, artistId: string } }) {
    const artist = await prisma.artist.findFirst({
        where: {
            id: params.artistId,
            sessionId: params.id
        },
        include: { session: true }
    })

    if (!artist) {
        return (
            <main className="flex-1 flex flex-col bg-black min-h-screen pt-48 items-center">
                <FadeIn y={20}>
                    <h1 className="text-4xl text-white font-bold uppercase tracking-tighter mb-4">Artista No Encontrado</h1>
                    <Link href={`/sessions/${params.id}`} className="brutalist-button">Volver</Link>
                </FadeIn>
            </main>
        )
    }

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen pt-24 pb-32">
            {/* Header with back button */}
            <section className="px-6 w-full max-w-[1400px] mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <FadeIn>
                    <Link href={`/sessions/${params.id}`} className="font-mono text-xs uppercase tracking-[0.2em] text-[#888] hover:text-white flex items-center gap-2 border border-[#333] px-3 py-1.5 w-fit hover:border-white transition-colors">
                        ← Volver al Lineup
                    </Link>
                </FadeIn>
                <FadeIn delay={0.2} className="w-full md:w-auto text-center font-mono text-xs text-white uppercase tracking-widest bg-[#111] px-4 py-2 border border-[#222]">
                    LIVE SET // {artist.session?.sessionNumber || 'S00'}
                </FadeIn>
            </section>

            {/* FULL WIDTH YOUTUBE PLAYER */}
            <section className="w-full max-w-[1400px] mx-auto px-6 mb-16">
                <FadeIn delay={0.3}>
                    {artist.youtube ? (
                        <div className="w-full aspect-video border border-[#333] bg-[#050505] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[#ffffff]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
                            <iframe
                                className="absolute inset-0 w-full h-full transition-all duration-[1500ms] p-1 md:p-2"
                                src={getEmbedUrl(artist.youtube)}
                                title={`Set de ${artist.name}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen>
                            </iframe>
                        </div>
                    ) : (
                        <div className="w-full aspect-video border border-[#333] bg-[#050505] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[#111] opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#333] via-[#111] to-[#0a0a0a]"></div>
                            <span className="font-mono text-[#555] uppercase tracking-widest text-sm relative z-10 border border-[#333] px-6 py-3 bg-black">TRANSMISIÓN AÚN NO DISPONIBLE</span>
                        </div>
                    )}
                </FadeIn>
            </section>

            {/* ARTIST INFO: PHOTO & BIO */}
            <section className="px-6 w-full max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Artist portrait & Name */}
                    <FadeIn delay={0.4} className="lg:col-span-5 flex flex-col gap-6">
                        <div className="w-full relative border border-[#333] bg-[#0a0a0a] grayscale hover:grayscale-0 transition-all duration-[2000ms] overflow-hidden group aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
                            <Image
                                src={(artist as any).profilePhoto || artist.photo || '/placeholder.jpg'}
                                alt={artist.name}
                                fill
                                className="object-cover object-[center_top] scale-105 group-hover:scale-100 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter text-white z-10 m-0 leading-none break-words">
                                    {artist.name}
                                </h1>
                            </div>
                        </div>
                    </FadeIn>

                    {/* BIO & MANIFESTO */}
                    <FadeIn delay={0.5} className="lg:col-span-7 flex flex-col h-full gap-8">
                        <div className="border-t border-[#333] pt-8 lg:pt-0 lg:border-t-0">
                            <div className="flex gap-4 items-center mb-8">
                                <span className="font-mono text-[10px] text-white bg-white/10 px-3 py-1 uppercase tracking-widest border border-[#333]">PERFIL // DATA</span>
                                <h2 className="text-2xl font-bold tracking-widest uppercase text-white">Biografía & Manifiesto</h2>
                            </div>
                            {artist.bio ? (
                                <div className="font-mono text-sm leading-relaxed text-[#888] whitespace-pre-line text-justify columns-1 sm:columns-2 gap-8">
                                    {artist.bio}
                                </div>
                            ) : (
                                <p className="font-mono text-sm leading-relaxed text-[#555] border-l-2 border-[#333] pl-4">
                                    [ Archivo confidencial // Ninguna biografía ha sido proporcionada para este individuo. ]
                                </p>
                            )}
                        </div>
                    </FadeIn>
                </div>
            </section>
        </main>
    )
}
