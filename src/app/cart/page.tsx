import Link from 'next/link'
import { FadeIn } from '@/components/ui/Animations'

export default function CartPage() {
    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-6xl mx-auto">

                <FadeIn y={20}>
                    <div className="border-b-4 border-white mb-12 pb-8 flex justify-between items-end">
                        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">
                            Carro de<br />Compras
                        </h1>
                        <span className="font-mono text-gray-500 uppercase tracking-widest text-sm hidden sm:block">
                            2 Artículos
                        </span>
                    </div>
                </FadeIn>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* LISTA DE ITEMS SIMULADOS */}
                    <FadeIn delay={0.2} className="flex-1 flex flex-col gap-8">

                        {/* Item 1 */}
                        <div className="flex gap-6 border-b border-gray-800 pb-8 group">
                            <Link href="/store/pol-001" className="w-24 md:w-32 aspect-[3/4] bg-gray-900 bg-[url('https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974')] bg-cover bg-center grayscale mix-blend-luminosity hover:scale-105 transition-transform duration-500 border border-gray-800 shrink-0"></Link>
                            <div className="flex-1 flex flex-col justify-between font-mono uppercase tracking-widest">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <Link href="/store/pol-001">
                                            <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">Polerón TR-Z</h3>
                                        </Link>
                                        <button className="text-gray-600 hover:text-white transition-colors" title="Eliminar artículo">✕</button>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">Talla: L</p>
                                    <p className="text-sm text-gray-500">Color: Negro</p>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div className="flex items-center gap-4">
                                        <button className="border border-gray-600 hover:border-white w-8 h-8 flex items-center justify-center transition-colors">-</button>
                                        <span className="text-white">1</span>
                                        <button className="border border-gray-600 hover:border-white w-8 h-8 flex items-center justify-center transition-colors">+</button>
                                    </div>
                                    <p className="text-gray-300 text-lg">$50.000</p>
                                </div>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex gap-6 border-b border-gray-800 pb-8 group">
                            <Link href="/store/pol-002" className="w-24 md:w-32 aspect-[3/4] bg-gray-900 bg-[url('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080')] bg-cover bg-center grayscale mix-blend-luminosity hover:scale-105 transition-transform duration-500 border border-gray-800 shrink-0"></Link>
                            <div className="flex-1 flex flex-col justify-between font-mono uppercase tracking-widest">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <Link href="/store/pol-002">
                                            <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">Polera Void</h3>
                                        </Link>
                                        <button className="text-gray-600 hover:text-white transition-colors" title="Eliminar artículo">✕</button>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">Talla: M</p>
                                    <p className="text-sm text-gray-500">Color: Negro</p>
                                </div>

                                <div className="flex justify-between items-end mt-4">
                                    <div className="flex items-center gap-4">
                                        <button className="border border-gray-600 hover:border-white w-8 h-8 flex items-center justify-center transition-colors">-</button>
                                        <span className="text-white">1</span>
                                        <button className="border border-gray-600 hover:border-white w-8 h-8 flex items-center justify-center transition-colors">+</button>
                                    </div>
                                    <p className="text-gray-300 text-lg">$25.000</p>
                                </div>
                            </div>
                        </div>

                        <Link href="/store" className="font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-white mt-4 pb-2 w-fit transition-colors group flex items-center gap-2">
                            <span className="group-hover:-translate-x-2 transition-transform">←</span> Seguir comprando
                        </Link>
                    </FadeIn>

                    {/* RESUMEN DE COMPRA */}
                    <FadeIn delay={0.4} className="w-full lg:w-[400px]">
                        <div className="bg-gray-950/50 border-2 border-gray-900 p-8 h-fit font-mono uppercase tracking-widest sticky top-32">
                            <h2 className="text-2xl font-bold mb-8 border-b-2 border-white pb-4">Resumen</h2>

                            <div className="space-y-4 mb-8 text-sm text-gray-400">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-white">$75.000</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Envío</span>
                                    <span className="text-xs border-b border-dashed border-gray-700 pb-1">Se calcula al pagar</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8 border-t-2 border-gray-800 pt-6">
                                <span className="text-lg">Total</span>
                                <span className="text-3xl font-bold text-white">$75.000</span>
                            </div>

                            <Link href="/checkout" className="brutalist-button block w-full text-center text-lg !py-5 bg-white text-black hover:bg-transparent hover:text-white transition-colors">
                                PROCEDER AL PAGO
                            </Link>

                            <div className="mt-6 flex flex-col items-center gap-3">
                                <div className="h-[1px] w-full bg-gray-900"></div>
                                <span className="text-[10px] text-gray-600 tracking-widest text-center mt-2">
                                    PAGO 100% SEGURO
                                    <br />
                                    ENCRIPTADO VÍA MERCADOPAGO
                                </span>
                            </div>
                        </div>
                    </FadeIn>

                </div>
            </div>
        </main>
    )
}
