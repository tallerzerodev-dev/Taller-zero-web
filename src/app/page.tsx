import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import { FadeIn, StaggerContainer } from '@/components/ui/Animations'
import { Ticker } from '@/components/ui/Ticker'

const prisma = new PrismaClient()
export const dynamic = 'force-dynamic'

export default async function Home() {
    const homeData = await prisma.homeContent.findUnique({
        where: { id: 'home-singleton' }
    })

    // Find a featured session, either from homeData or fallback to latest session
    let featuredSession = null
    if (homeData?.featuredSessionId) {
        featuredSession = await prisma.session.findUnique({
            where: { id: homeData.featuredSessionId }
        })
    } else {
        // Get latest active session
        featuredSession = await prisma.session.findFirst({
            orderBy: { createdAt: 'desc' }
        })
    }

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen">
            {/* HERO REGISTRATOR */}
            <section className="relative px-6 md:px-12 lg:px-20 xl:px-24 w-full min-h-[max(calc(100vh-200px),600px)] flex flex-col justify-end pb-24 md:pb-32 border-b border-[#333] overflow-hidden">
                {/* VIDEO / IMAEN DE FONDO */}
                {homeData?.heroBackground && (
                    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-40">
                        {homeData.heroBackground.toLowerCase().endsWith('.mp4') || homeData.heroBackground.toLowerCase().endsWith('.webm') || homeData.heroBackground.toLowerCase().endsWith('.mov') ? (
                            <video src={homeData.heroBackground} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${homeData.heroBackground})` }}></div>
                        )}
                    </div>
                )}

                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent mix-blend-screen opacity-50 z-0"></div>
                <div className="absolute top-0 right-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-[#333] to-transparent mix-blend-screen opacity-50 z-0"></div>

                <StaggerContainer className="z-10 relative">
                    <FadeIn y={30}>
                        <span className="font-mono text-xs md:text-sm uppercase tracking-[0.4em] font-bold bg-white text-black px-3 py-1 mb-8 inline-block select-none">
                            {homeData?.heroSubtitle || 'RADIO ESTACION UNDERGROUND'}
                        </span>
                    </FadeIn>
                    <FadeIn y={20} delay={0.2}>
                        <h1 className="text-[12vw] sm:text-[10vw] md:text-[8vw] xl:text-[7rem] font-bold uppercase tracking-tighter text-white leading-[0.85] w-full max-w-5xl mb-12 mix-blend-difference selection:bg-white selection:text-black">
                            {homeData?.heroTitle || 'LA NUEVA ESCUELA DEL BEAT'}
                        </h1>
                    </FadeIn>
                    <FadeIn y={20} delay={0.4}>
                        <div className="group inline-block">
                            <Link href="/about" className="flex items-center gap-4 text-[#888] font-mono hover:text-white transition-colors duration-300">
                                <span className="text-xs uppercase tracking-widest">+ EXPLORAR EL MANIFIESTO</span>
                                <span className="w-12 h-[1px] bg-[#333] group-hover:bg-white group-hover:w-24 transition-all duration-500 ease-out"></span>
                            </Link>
                        </div>
                    </FadeIn>
                </StaggerContainer>
            </section>

            {/* INFINITE TICKER / MARQUEE */}
            <section className="bg-white text-black py-4 border-y-4 border-black overflow-hidden relative z-20">
                <Ticker
                    text={homeData?.tickerText || "CONECTANDO EL SUBSUELO | SESIONES EN VIVO | 100% RAW | NO FAKE SHIT | REAL TIME BROADCAST"}
                />
            </section>

            {/* FEATURED / LATEST SESSION */}
            <section className="px-6 md:px-12 lg:px-20 xl:px-24 py-24 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 border-b border-[#333]">
                <FadeIn>
                    <div className="flex flex-col h-full justify-center">
                        <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em] font-bold border border-[#333] px-2 py-1 mb-6 self-start">
                            TRANSMISIÓN DESTACADA
                        </span>
                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tighter text-white mb-6 leading-none">
                            {homeData?.featuredSessionTitle || featuredSession?.title || 'ÚLTIMO REGISTRO EN VIVO'}
                        </h2>
                        <p className="text-[#888] font-mono text-xs sm:text-sm uppercase tracking-widest leading-relaxed mb-10 max-w-md">
                            REVIVE EL ÚLTIMO SET DIRECTO DESDE NUESTRAS INSTALACIONES. AUDIO RAW, CÁMARAS ESTÁTICAS, SIN CENSURA.
                        </p>
                        {featuredSession ? (
                            <Link href={`/sessions/${featuredSession.id}`} className="brutalist-button w-fit">
                                VER SESIÓN AHORA
                            </Link>
                        ) : (
                            <Link href="/sessions" className="brutalist-button w-fit">
                                EXPLORAR SESIONES
                            </Link>
                        )}
                    </div>
                </FadeIn>
                <FadeIn delay={0.2} y={20}>
                    <div className="group block relative w-full aspect-[4/5] sm:aspect-square bg-[#0a0a0a] border border-[#333] overflow-hidden hover:border-white transition-colors duration-500">
                        {/* Si homeData tiene imagen definida, usamos esa, sino el gif de la sesion */}
                        {(() => {
                            const bgUrl = homeData?.featuredSessionGif || featuredSession?.gifUrl || '/placeholder.jpg';
                            const isVideo = bgUrl.toLowerCase().endsWith('.mp4') || bgUrl.toLowerCase().endsWith('.webm') || bgUrl.toLowerCase().endsWith('.mov');

                            return isVideo ? (
                                <video src={bgUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover grayscale mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000 origin-center" />
                            ) : (
                                <div
                                    className="absolute inset-0 bg-cover bg-center grayscale mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000 origin-center"
                                    style={{ backgroundImage: `url(${bgUrl})` }}
                                ></div>
                            );
                        })()}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10 mix-blend-difference">
                            <span className="font-mono text-xs bg-white text-black px-3 py-1 uppercase tracking-widest font-bold">REC //</span>
                            {featuredSession && (
                                <span className="font-mono text-xs text-white uppercase tracking-widest border border-white/30 px-2 py-1 backdrop-blur-sm bg-black/50">
                                    {featuredSession.dateText}
                                </span>
                            )}
                        </div>
                    </div>
                </FadeIn>
            </section>

            {/* THE STORE / BRAND FEATURE - OCULTADO TEMPORALMENTE */}
            {false && (
                <section className="px-6 md:px-12 lg:px-20 xl:px-24 py-24 w-full border-b border-[#333]">
                    <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
                        <FadeIn y={20}>
                            <span className="font-mono text-xs text-[#555] uppercase tracking-[0.3em] font-bold mb-4 inline-block">MERCANCÍA OFICIAL</span>
                            <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white mb-6">UNIFORMES DE INVIERNO</h2>
                        </FadeIn>
                    </div>

                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Mock Product 1 */}
                        <FadeIn y={10}>
                            <Link href="/store" className="group block focus:outline-none h-full">
                                <div className="border border-[#333] bg-[#0a0a0a] group-hover:border-white transition-colors duration-300 p-6 flex flex-col h-full relative overflow-hidden">
                                    <span className="absolute top-4 right-4 font-mono text-[10px] bg-white text-black px-2 py-0.5 uppercase tracking-widest font-bold z-10">NUEVO</span>
                                    <div className="w-full aspect-square bg-[#111] mb-6 flex items-center justify-center relative overflow-hidden">
                                        {homeData?.featuredItemImage ? (
                                            <div className="absolute inset-0 bg-cover bg-center grayscale mix-blend-screen opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `url(${homeData?.featuredItemImage})` }}></div>
                                        ) : (
                                            <span className="text-[#333] font-mono text-xs uppercase tracking-widest">NO IMAGE</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-2">{homeData?.featuredItemTitle || 'HEAVY TEE "01"'}</h3>
                                    <p className="font-mono text-xs text-[#888] mb-6 flex-1 line-clamp-2">{homeData?.featuredItemSubtitle || 'Algodón peinado 280g. Corte boxy.'}</p>
                                    <div className="flex justify-between items-center border-t border-[#333] pt-4 group-hover:border-white/50 transition-colors">
                                        <span className="font-mono text-sm text-white">$45.000 COP</span>
                                        <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest group-hover:text-white transition-colors">Ver Detalles +</span>
                                    </div>
                                </div>
                            </Link>
                        </FadeIn>
                        {/* Mock Product 2 */}
                        <FadeIn delay={0.1} y={10}>
                            <div className="border border-[#333] bg-[#0a0a0a] opacity-50 focus:outline-none h-full p-6 flex flex-col relative">
                                <div className="w-full aspect-square bg-[#111] mb-6 flex items-center justify-center relative">
                                    <span className="text-[#333] font-mono text-xs uppercase tracking-widest transform -rotate-45">AGOTADO</span>
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-2">HOODIE "VOID"</h3>
                                <p className="font-mono text-xs text-[#888] mb-6 flex-1 line-clamp-2">Polar fleece 320g. Oversized.</p>
                                <div className="flex justify-between items-center border-t border-[#333] pt-4">
                                    <span className="font-mono text-sm text-[#555]">$85.000 COP</span>
                                    <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest">SOLD OUT</span>
                                </div>
                            </div>
                        </FadeIn>
                        {/* Mock Product 3 */}
                        <FadeIn delay={0.2} y={10}>
                            <div className="border border-[#333] bg-[#0a0a0a] focus:outline-none h-full p-6 flex flex-col relative group">
                                <div className="w-full aspect-square bg-[#111] mb-6 flex items-center justify-center relative">
                                    <span className="text-[#555] font-mono text-[10px] uppercase tracking-widest">PRÓXIMAMENTE</span>
                                </div>
                                <h3 className="text-xl font-bold uppercase tracking-widest text-[#aaa] group-hover:text-white transition-colors mb-2">BEAINE "RAW"</h3>
                                <p className="font-mono text-xs text-[#888] mb-6 flex-1 line-clamp-2">Tejido acrílico. Etiqueta frontal.</p>
                                <div className="flex justify-between items-center border-t border-[#333] pt-4">
                                    <span className="font-mono text-sm text-[#555]">TBA</span>
                                    <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest">COMING SOON</span>
                                </div>
                            </div>
                        </FadeIn>
                    </StaggerContainer>

                    <div className="flex justify-center mt-12">
                        <Link href="/store" className="font-mono text-xs uppercase tracking-[0.2em] text-[#888] hover:text-white border border-[#333] px-6 py-3 hover:border-white transition-colors">
                            VER CATÁLOGO COMPLETO
                        </Link>
                    </div>
                </section>
            )}

        </main>
    )
}
