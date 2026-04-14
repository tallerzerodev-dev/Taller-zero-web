import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { FadeIn } from '@/components/ui/Animations'
import Image from 'next/image'
import Link from 'next/link'
import { AddToCartPanel } from '@/components/store/AddToCartPanel'

export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    const product = await prisma.product.findUnique({
        where: { id: params.id }
    })

    if (!product) {
        notFound()
    }

    await prisma.product.update({
        where: { id: params.id },
        data: { views: { increment: 1 } }
    })

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen pt-24 pb-20 px-6 md:px-12 lg:px-20 xl:px-24">
            <div className="max-w-[1600px] w-full mx-auto">
                <FadeIn y={20}>
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                        {/* Izquierda: Imagen Principal */}
                        <div className="w-full lg:w-1/2 relative">
                            <div className="lg:sticky lg:top-24">
                                <Link href="/store" className="font-mono text-[10px] text-[#555] hover:text-white uppercase tracking-[0.3em] font-bold mb-8 inline-block transition-colors">
                                    <span className="mr-2">←</span> VOLVER A LA TIENDA
                                </Link>

                                <div className="w-full relative aspect-[4/5] bg-[#111] border border-[#333] flex items-center justify-center p-8 mt-2">
                                    {!product.isAvailable && (
                                        <div className="absolute top-4 right-4 z-20 bg-red-600 text-white font-mono text-[10px] font-bold px-4 py-2 tracking-[0.3em] uppercase shadow-lg">
                                            AGOTADO
                                        </div>
                                    )}
                                    {product.images[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.title}
                                            fill
                                            priority
                                            className={`Object-cover object-center ${product.isAvailable ? 'grayscale opacity-40' : ''}`}
                                        />
                                    ) : (
                                        <span className="font-mono text-[#333] text-sm uppercase tracking-widest">Sin imagen</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Derecha: Detalles del Producto */}
                        <div className="w-full lg:w-1/2 flex flex-col pt-4 lg:pt-[104px]">
                            <div className="border-b border-[#333] pb-8 mb-8">
                                <span className="font-mono text-[10px] uppercase text-[#666] tracking-[0.3em] mb-4 block">{`///`} {product.category}</span>
                                <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white leading-[0.9] mb-4">
                                    {product.title}
                                </h1>
                                <p className="text-2xl md:text-3xl font-mono tracking-widest text-[#bbb]">
                                    ${product.price.toLocaleString('es-CL')}
                                </p>
                            </div>

                            <div className="mb-12">
                                <h3 className="font-mono text-[#555] uppercase text-xs tracking-[0.3em] font-bold mb-4">DESCRIPCIÓN</h3>
                                <div className="text-[#aaa] font-sans text-lg font-light leading-relaxed max-w-prose whitespace-pre-wrap">
                                    {product.description || 'Sin descripción disponible para este producto.'}
                                </div>
                            </div>

                            <AddToCartPanel product={product} />
                        </div>
                    </div>
                </FadeIn>
            </div>
        </main>
    )
}
