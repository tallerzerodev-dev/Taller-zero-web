import Link from 'next/link'
import Image from 'next/image'
import { FadeIn, StaggerContainer } from '@/components/ui/Animations'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function StorePage({ searchParams }: { searchParams: { category?: string } }) {
    const selectedCategory = searchParams?.category || 'TODO'

    const where = selectedCategory === 'TODO' ? {} : { category: selectedCategory }
    const products = await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    })

    const categories = await prisma.product.groupBy({
        by: ['category'],
        _count: { category: true }
    })

    return (
        <main className="flex-1 flex flex-col items-center bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-[1600px] mx-auto">
                <FadeIn y={20}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#333] mb-12 pb-8 gap-6">
                        <div>
                            <span className="font-mono text-[10px] md:text-xs text-[#555] uppercase tracking-[0.3em] font-bold mb-4 inline-block">{`/// `}TALLER ZERO OFICIAL</span>
                            <h1 className="text-[12vw] sm:text-[8vw] md:text-[6vw] lg:text-[5rem] px-0 font-bold uppercase tracking-tighter text-white leading-[0.85]">
                                MERCH<br />STORE
                            </h1>
                            <p className="text-[#888] font-mono text-xs md:text-sm mt-8 uppercase tracking-widest max-w-lg">
                                Equipamiento oficial. Colecciones limitadas y exclusivas.
                            </p>
                        </div>
                        <div className="font-mono text-[10px] md:text-xs uppercase text-gray-500 tracking-widest text-left md:text-right">
                            <p className="mb-2">Envíos a todo Chile</p>
                            <p>Stock Limitado</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-16">
                        <Link
                            href="/store"
                            className={`font-mono text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${selectedCategory === 'TODO' ? 'border-white text-white bg-white/5' : 'border-[#333] text-[#888] hover:text-white hover:border-[#666]'}`}
                        >
                            TODO
                        </Link>
                        {categories.map((c) => (
                            <Link
                                key={c.category}
                                href={`/store?category=${c.category}`}
                                className={`font-mono text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${selectedCategory === c.category ? 'border-white text-white bg-white/5' : 'border-[#333] text-[#888] hover:text-white hover:border-[#666]'}`}
                            >
                                {c.category.toUpperCase()}
                            </Link>
                        ))}
                    </div>
                </FadeIn>

                {products.length === 0 ? (
                    <div className="py-32 text-center border border-[#333] bg-[#0a0a0a]">
                        <span className="font-mono text-sm text-[#555] uppercase tracking-widest">
                            {selectedCategory === 'TODO' ? 'PRÓXIMAMENTE DISPONIBLE.' : 'NO HAY PRODUCTOS EN ESTA CATEGORÍA.'}
                        </span>
                    </div>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                        {products.map((product) => (
                            <FadeIn key={product.id} className="group block cursor-pointer">
                                <Link href={`/store/${product.id}`}>
                                    <div className="w-full aspect-[4/5] bg-[#111] border border-[#222] group-hover:border-[#666] transition-colors duration-500 relative overflow-hidden mb-4 p-4 flex items-center justify-center">
                                        {!product.isAvailable && (
                                            <div className="absolute top-4 right-4 z-20 bg-red-600 text-white font-mono text-[10px] font-bold px-2 py-1 tracking-widest uppercase">
                                                SOLD OUT
                                            </div>
                                        )}
                                        {product.images[0] ? (
                                            <Image
                                                src={product.images[0]}
                                                alt={product.title}
                                                fill
                                                className={`object-cover object-center transition-transform duration-700 group-hover:scale-105 ${!product.isAvailable ? 'grayscale opacity-30 shadow-inner' : 'opacity-90 group-hover:opacity-100'}`}
                                            />
                                        ) : (
                                            <div className="font-mono text-[#333] text-xs uppercase tracking-widest">Sin foto</div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-start font-mono tracking-widest">
                                        <span className="text-[10px] text-[#666] uppercase mb-1">{product.category}</span>
                                        <h3 className="text-sm font-bold text-white uppercase line-clamp-1 group-hover:text-[#aaa] transition-colors">{product.title}</h3>
                                        <div className="flex justify-between w-full items-center mt-1">
                                            <span className="text-white text-sm relative">
                                                ${product.price.toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </FadeIn>
                        ))}
                    </StaggerContainer>
                )}
            </div>
        </main>
    )
}
