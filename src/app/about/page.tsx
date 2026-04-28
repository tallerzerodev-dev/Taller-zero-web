import type { Metadata } from 'next'
import { FadeIn } from '@/components/ui/Animations'
import Image from 'next/image'

import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'The Vision | Quiénes Somos',
  description: 'Taller Zero: plataforma de música electrónica underground desde Chile. Techno, hypnotic techno, hardgroove y más. Sesiones en vivo en formato RAW desde locaciones industriales.',
  keywords: [
    'Taller Zero', 'quienes somos', 'about', 'techno Chile', 'música electrónica Chile',
    'underground Chile', 'sesiones en vivo', 'bodega sessions', 'industrial techno',
    'hypnotic techno', 'hardgroove Chile', 'plataforma techno', 'djs chilenos',
    'techno underground', 'raw techno', 'electronic music Chile', 'techno sessions Chile'
  ],
}

export const dynamic = 'force-dynamic'

export default async function AboutPage() {
    let aboutContent = await prisma.aboutContent.findUnique({
      where: { id: 'about-singleton' }
    })

    const defaultInfoSquares = [
        { title: "SESSIONS", desc: "Sets exclusivos grabados en formato video/audio desde locaciones industriales secretas. Solo techno, industrial y variantes contundentes del sonido underground.", bgColor: "bg-gray-950" },
        { title: "MERCH", desc: "Diseño utilitario. Prendas fabricadas con algoritmos de alta resistencia y gramaje pesado. Creado por y para quienes habitan el ecosistema nocturno y diurno.", bgColor: "bg-gray-950" },
        { title: "COMMUNITY", desc: "Fomentamos una red de creativos, djs, productores y artesanos. La intersección final donde el esfuerzo artesanal se cruza con las visuales digitales.", bgColor: "bg-gray-950" },
        { title: "NEW SQUARE", desc: "Espacio disponible para más manifiestos.", bgColor: "bg-gray-950" }
    ]

    if (!aboutContent) {
      aboutContent = {
        id: 'about-singleton',
        title: 'Taller Zero',
        content: 'Nacimos de la necesidad de fusionar dos mundos que coexisten en paralelo: el trabajo manual/creativo y la música electrónica de vanguardia.\n\nConvertimos talleres, bodegas y espacios de manufactura reales en escenarios efímeros. Documentamos sets en crudo, sin filtros, capturando la energía industrial del entorno y la brutalidad del sonido.',
        coverImage: 'https://images.unsplash.com/photo-1599423423926-b8b80b206412?q=80&w=2070&auto=format&fit=crop',
        showMarquee: true,
        marqueeText: '• RAW AUDIO • INDUSTRIAL VISUALS • HEAVYWEIGHT MERCH • NO COMPROMISE • BODEGA SESSIONS',
        infoSquares: defaultInfoSquares as any,
        updatedAt: new Date()
      }
    }

    const marqueeText = aboutContent.marqueeText || '• RAW AUDIO • INDUSTRIAL VISUALS • HEAVYWEIGHT MERCH • NO COMPROMISE • BODEGA SESSIONS'
    let infoSquares = defaultInfoSquares;
    if (aboutContent.infoSquares) {
        try {
            infoSquares = typeof aboutContent.infoSquares === 'string' ? JSON.parse(aboutContent.infoSquares as string) : aboutContent.infoSquares;
        } catch(e) {
            console.error(e)
        }
    }
    // Ensure we only have up to 4 squares
    infoSquares = infoSquares.slice(0, 4);

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen pt-24 pb-32">

            {/* HERO ABOUT */}
            <section className="px-6 w-full max-w-7xl mx-auto mb-24">
                <FadeIn delay={0.1}>
                    <div className="border-b-4 border-white pb-8 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <h1 className="text-6xl md:text-9xl font-bold uppercase tracking-tighter leading-none">
                            The<br />Vision
                        </h1>
                        <p className="font-mono text-gray-500 uppercase tracking-widest max-w-xs text-sm md:text-right">
                            No somos un club. <br />Somos un espacio de creación.
                        </p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <FadeIn delay={0.3} className="aspect-square bg-gray-900 border-4 border-gray-800 relative group overflow-hidden">
                        <Image
                            src={aboutContent.coverImage || "https://images.unsplash.com/photo-1599423423926-b8b80b206412?q=80&w=2070&auto=format&fit=crop"}
                            alt="Taller Zero - Espacio industrial de música underground en Chile"
                            fill
                            className="object-cover mix-blend-luminosity grayscale group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 border-[16px] border-black/20 mix-blend-overlay pointer-events-none"></div>
                    </FadeIn>

                    <FadeIn delay={0.5} y={40} className="flex flex-col gap-8">
                        <h2 className="text-3xl font-mono font-bold uppercase tracking-widest text-white">
                            {aboutContent.title}
                        </h2>
                        <div className="text-gray-400 font-sans text-lg md:text-xl leading-relaxed space-y-6 whitespace-pre-line">
                            <p>
                                {aboutContent.content}
                            </p>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* MANIFESTO MARQUEE */}
            {aboutContent.showMarquee && (
                <section className="w-full bg-white text-black py-4 overflow-hidden mb-24 rotate-[-1deg] scale-105">
                    <div className="flex w-max animate-[marquee_20s_linear_infinite]">
                        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter whitespace-nowrap px-8">
                            {marqueeText}
                        </h2>
                        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter whitespace-nowrap px-8">
                            {marqueeText}
                        </h2>
                    </div>
                </section>
            )}

            {/* TEAM / MANIFESTO */}
            <section className="px-6 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {infoSquares.map((item: any, i: number) => (
                    <FadeIn delay={0.1 * i} key={i} className={`${item.bgColor || 'bg-gray-950'} border border-gray-800 p-8 hover:border-white transition-colors duration-500 group`}>
                        <h3 className="font-mono text-xl font-bold uppercase tracking-widest text-white mb-4 group-hover:-translate-y-2 transition-transform duration-300">
                            {item.title}
                        </h3>
                        <p className="text-gray-500 font-sans text-base leading-relaxed group-hover:text-gray-300 transition-colors">
                            {item.desc}
                        </p>
                    </FadeIn>
                ))}
            </section>

        </main>
    )
}
