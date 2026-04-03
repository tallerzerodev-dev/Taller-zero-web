import Link from 'next/link'
import { FadeIn } from '@/components/ui/Animations'

export default function CheckoutPage() {
    return (
        <main className="flex-1 flex justify-center bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-16">

                {/* DATOS DE ENVÍO */}
                <FadeIn className="w-full md:w-2/3 flex flex-col">
                    <div className="border-b-4 border-white mb-8 pb-4 flex items-center justify-between">
                        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">
                            Checkout
                        </h1>
                        <Link href="/cart" className="font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                            ← Carro
                        </Link>
                    </div>

                    <form className="space-y-6 font-mono text-sm uppercase tracking-widest">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-gray-400">Nombre</label>
                                <input type="text" className="bg-transparent border-2 border-gray-800 p-4 focus:border-white focus:outline-none transition-colors text-white" required />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-gray-400">Apellido</label>
                                <input type="text" className="bg-transparent border-2 border-gray-800 p-4 focus:border-white focus:outline-none transition-colors text-white" required />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400">Email</label>
                            <input type="email" className="bg-transparent border-2 border-gray-800 p-4 focus:border-white focus:outline-none transition-colors text-white" required />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400">Dirección Completa</label>
                            <input type="text" className="bg-transparent border-2 border-gray-800 p-4 focus:border-white focus:outline-none transition-colors text-white" required />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-gray-400">Comuna</label>
                                <input type="text" className="bg-transparent border-2 border-gray-800 p-4 focus:border-white focus:outline-none transition-colors text-white" required />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-gray-400">Región</label>
                                <input type="text" className="bg-transparent border-2 border-gray-800 p-4 focus:border-white focus:outline-none transition-colors text-white" required />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400">Teléfono</label>
                            <input type="tel" className="bg-transparent border-2 border-gray-800 p-4 focus:border-white focus:outline-none transition-colors text-white" required />
                        </div>
                    </form>
                </FadeIn>

                {/* RESUMEN FINAL */}
                <FadeIn delay={0.2} className="w-full md:w-1/3">
                    <div className="bg-gray-950/50 border-2 border-gray-900 p-8 h-fit font-mono uppercase tracking-widest sticky top-32">
                        <h2 className="text-xl font-bold mb-6 border-b-2 border-white pb-4">Pago</h2>

                        <div className="space-y-4 mb-6 text-sm text-gray-400 border-b border-gray-800 pb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-white">$75.000</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Envío</span>
                                <span className="text-white">$5.000</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-8">
                            <span className="text-lg">Total</span>
                            <span className="text-2xl font-bold text-white">$80.000</span>
                        </div>

                        <button className="brutalist-button flex flex-col items-center justify-center gap-1 w-full text-center !py-4 bg-white text-black hover:bg-transparent hover:text-white transition-colors">
                            <span className="text-sm font-bold">PAGAR CON</span>
                            <span className="text-xs">MERCADOPAGO</span>
                        </button>
                    </div>
                </FadeIn>

            </div>
        </main>
    )
}
