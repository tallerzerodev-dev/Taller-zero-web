import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { FadeIn, StaggerContainer } from '@/components/ui/Animations'
import { Ticker } from '@/components/ui/Ticker'
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
                            <Image src={homeData.heroBackground} alt="Hero Background" fill className="object-cover object-center" />
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
                                <Image
                                    src={bgUrl}
                                    alt="Featured Session"
                                    fill
                                    className="object-cover object-center grayscale mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000 origin-center"
                                />
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

        </main>
    )
}
