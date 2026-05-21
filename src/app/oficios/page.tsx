import { prisma } from '@/lib/prisma'
import OficiosGallery from './OficiosGallery'

export const dynamic = 'force-dynamic'

export default async function OficiosPage() {
    const oficios = await prisma.oficio.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-7xl mx-auto">
                <div className="border-b-4 border-white mb-12 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <span className="font-mono text-[10px] md:text-xs text-[#555] uppercase tracking-[0.3em] font-bold mb-4 inline-block">{`/// `}COLABORADORES</span>
                        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-white">
                            Oficios
                        </h1>
                    </div>
                    <div className="font-mono text-sm uppercase tracking-widest text-[#888]">
                        LA RED TALLER ZERO
                    </div>
                </div>

                <OficiosGallery oficios={oficios} />
            </div>
        </main>
    )
}
