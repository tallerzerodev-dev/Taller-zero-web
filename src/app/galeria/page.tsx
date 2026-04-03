import { PrismaClient } from '@prisma/client'
import { FadeIn } from '@/components/ui/Animations'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export default async function GaleriaPage({
    searchParams,
}: {
    searchParams: { session?: string }
}) {
    const sessionId = searchParams?.session || ''

    // Fetch filters (Sessions that have photos)
    const sessions = await prisma.session.findMany({
        where: { photos: { some: {} } },
        orderBy: { createdAt: 'desc' }
    })

    // Fetch photos
    const where = sessionId ? { sessionId } : {}
    const photos = await prisma.photo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { session: true }
    })

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen pt-24 pb-20 px-6 md:px-12 lg:px-20 xl:px-24">
            <div className="max-w-[1600px] w-full mx-auto">
                <FadeIn y={20}>
                    <header className="mb-12 border-b border-[#333] pb-12">
                        <span className="font-mono text-[10px] md:text-xs text-[#555] uppercase tracking-[0.3em] font-bold mb-4 inline-block">MUNDO VISUAL</span>
                        <h1 className="text-[12vw] sm:text-[8vw] md:text-[6vw] lg:text-[5rem] px-0 font-bold uppercase tracking-tighter text-white leading-[0.85] mb-8">
                            GALERÍA
                        </h1>

                        <div className="flex flex-wrap gap-4 mt-8">
                            <Link
                                href="/galeria"
                                className={`font-mono text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${!sessionId ? 'border-white text-white bg-white/5' : 'border-[#333] text-[#888] hover:text-white hover:border-[#666]'}`}
                            >
                                TODO
                            </Link>
                            {sessions.map(s => (
                                <Link
                                    key={s.id}
                                    href={`/galeria?session=${s.id}`}
                                    className={`font-mono text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${sessionId === s.id ? 'border-white text-white bg-white/5' : 'border-[#333] text-[#888] hover:text-white hover:border-[#666]'}`}
                                >
                                    {s.title}
                                </Link>
                            ))}
                        </div>
                    </header>
                </FadeIn>

                {photos.length === 0 ? (
                    <div className="text-center py-32 border border-[#333] bg-[#0a0a0a]">
                        <span className="font-mono text-sm text-[#555] uppercase tracking-widest">AÚN NO HAY REGISTROS VISUALES.</span>
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {photos.map((photo, i) => (
                            <div key={photo.id} className="break-inside-avoid relative group cursor-pointer mb-6 border border-[#222]">
                                <img
                                    src={photo.url}
                                    alt={photo.caption || 'Galería foto'}
                                    className="w-full h-auto object-cover grayscale opacity-75 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 block"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-4 transition-opacity duration-300">
                                    <div className="mix-blend-difference z-10">
                                        {photo.session && (
                                            <span className="font-mono text-[10px] bg-white text-black px-2 py-0.5 uppercase tracking-widest font-bold inline-block mb-2">
                                                {photo.session.title}
                                            </span>
                                        )}
                                        {photo.caption && (
                                            <p className="font-mono text-xs text-white uppercase tracking-widest">
                                                {photo.caption}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}