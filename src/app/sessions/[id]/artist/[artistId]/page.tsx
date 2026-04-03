import type { Metadata } from 'next'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/Animations'
import Image from 'next/image'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string, artistId: string } }): Promise<Metadata> {
    const artist = await prisma.artist.findFirst({
        where: { id: params.artistId, sessionId: params.id },
        include: { session: true }
    })
    if (!artist) return { title: 'Artista No Encontrado' }

    const desc = artist.bio || `Live set de ${artist.name} en ${artist.session.title}. Registros visuales Taller Zero.`

    return {
        title: `${artist.name} | ${artist.session.title}`,
        description: desc,
        keywords: [artist.name, artist.session.title, 'techno', 'live set', 'dj set', 'underground'],
        openGraph: {
            title: `${artist.name} | Live Set en Taller Zero`,
            description: desc,
            images: artist.photo ? [{ url: artist.photo }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: artist.name,
            description: desc,
            images: artist.photo ? [artist.photo] : undefined,
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
        }
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
            <section className="px-6 w-full max-w-[1400px] mx-auto mb-12 flex flex-col md:flex-row items-center justify-between border-b border-[#333] pb-8 gap-4">
                <FadeIn>
                    <Link href={`/sessions/${params.id}`} className="font-mono text-xs uppercase tracking-[0.2em] text-[#888] hover:text-white flex items-center gap-2 border border-[#333] px-3 py-1.5 w-fit hover:border-white transition-colors">
                        ← Volver al Lineup
                    </Link>
                </FadeIn>
                <FadeIn delay={0.2} className="w-full md:w-auto text-center font-mono text-xs text-[#ff3333] uppercase tracking-widest bg-[#111] px-4 py-2 border border-[#222]">
                    [ LIVE SET. ] TALLER ZERO
                </FadeIn>
            </section>

            {/* ARTIST HERO: PHOTO + YOUTUBE PLAYER */}
            <section className="px-6 w-full max-w-[1400px] mx-auto mb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Artist portrait & Name */}
                    <FadeIn delay={0.3} className="lg:col-span-4 flex flex-col gap-6">
                        <div className="aspect-[3/4] relative border border-[#333] bg-[#0a0a0a] grayscale hover:grayscale-0 transition-all duration-[2000ms] overflow-hidden group mix-blend-luminosity hover:mix-blend-normal">
                            <Image
                                src={artist.photo || '/placeholder.jpg'}
                                alt={artist.name}
                                fill
                                className="object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                            <h1 className="absolute bottom-6 left-6 text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white z-10 m-0 leading-none break-all border-l-4 pl-3 border-[#ff3333]">
                                {artist.name}
                            </h1>
                        </div>
                    </FadeIn>

                    {/* Video and Info */}
                    <FadeIn delay={0.4} className="lg:col-span-8 flex flex-col h-full gap-8">
                        {/* THE YOUTUBE PLAYER */}
                        {artist.youtube ? (
                            <div className="w-full aspect-video border-[1px] border-[#333] bg-[#050505] p-2 relative">
                                <iframe
                                    className="absolute inset-0 w-full h-full grayscale hover:grayscale-0 transition-all duration-[1500ms] p-2"
                                    src={getEmbedUrl(artist.youtube)}
                                    title={`Set de ${artist.name}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen>
                                </iframe>
                            </div>
                        ) : (
                            <div className="w-full aspect-video border-[1px] border-[#333] bg-[#050505] p-2 flex flex-col items-center justify-center">
                                <span className="font-mono text-[#555] uppercase tracking-widest text-sm">TRANSMISIÓN AÚN NO DISPONIBLE</span>
                            </div>
                        )}

                        {/* BIO & MANIFESTO */}
                        <div className="border border-[#222] bg-[#0a0a0a] p-8 md:p-12 mb-8">
                            <div className="flex gap-4 items-center mb-6 border-b border-[#333] pb-4">
                                <span className="w-3 h-3 bg-[#ff3333] block"></span>
                                <h2 className="text-xl font-bold tracking-widest uppercase text-white">Biografía & Manifiesto</h2>
                            </div>
                            {artist.bio ? (
                                <p className="font-mono text-sm leading-relaxed text-[#888] whitespace-pre-line">
                                    {artist.bio}
                                </p>
                            ) : (
                                <p className="font-mono text-sm leading-relaxed text-[#555]">
                                    [ Archivo confidencial // Ninguna biografía ha sido proporcionada. ]
                                </p>
                            )}
                        </div>
                    </FadeIn>

                </div>
            </section>
        </main>
    )
}
