'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/ui/Animations'
import { useCartStore } from '@/store/useCartStore'
import { useEffect, useState } from 'react'

export default function CartPage() {
    const [isMounted, setIsMounted] = useState(false)
    const { items, totalItems, totalPrice, removeItem, updateQuantity } = useCartStore()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-6xl mx-auto">
                <FadeIn y={20}>
                    <div className="border-b-4 border-white mb-12 pb-8 flex justify-between items-end">
                        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter">
                            Carro de<br />Compras
                        </h1>
                        <span className="font-mono text-gray-500 uppercase tracking-widest text-sm hidden sm:block">
                            {totalItems()} Artículos
                        </span>
                    </div>
                </FadeIn>

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* LISTA DE ITEMS */}
                    <FadeIn delay={0.2} className="flex-1 flex flex-col gap-8">
                        {items.length === 0 ? (
                            <div className="py-16 text-center border-dashed border-gray-800">
                                <p className="font-mono text-gray-500 uppercase tracking-widest mb-4">Tu carrito está vacío.</p>
                                <Link href="/store" className="brutalist-button inline-block max-w-fit">
                                    VOLVER A LA TIENDA
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                {items.map((item) => (
                                    <div key={`${item.id}-${item.size}`} className="flex gap-6 border-b border-gray-800 pb-8 group">
                                        <Link href={`/store/${item.id}`} className="w-full max-w-[24px] md:max-w-[32px] aspect-[3/4] relative bg-gray-900 border border-gray-800 shrink-0 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover object-center grayscale mix-blend-luminosity group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </Link>

                                        <div className="flex-1 flex flex-col justify-between font-mono uppercase tracking-widest">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <Link href={`/store/${item.id}`}>
                                                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">
                                                            {item.title}
                                                        </h3>
                                                    </Link>
                                                    <button onClick={() => removeItem(item.id, item.size)} className="text-gray-600 hover:text-white transition-colors" title="Eliminar artículo">✕</button>
                                                </div>
                                                {item.size && <p className="text-sm text-gray-500 mb-1">Talla: {item.size}</p>}
                                                <p className="text-sm text-gray-500">Categoria: {item.category}</p>
                                            </div>

                                            <div className="flex justify-between items-end mt-4">
                                                <div className="flex items-center gap-4">
                                                    <button disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.size, -1)} className="border border-gray-600 hover:border-white w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                                                    <span className="text-white">{item.quantity}</span>
                                                    <button disabled={item.quantity >= item.maxStock} onClick={() => updateQuantity(item.id, item.size, 1)} className="border border-gray-600 hover:border-white w-8 h-8 flex items-center justify-center transition-colors disabled:opacity-50">+</button>
                                                </div>
                                                <p className="text-gray-300 text-lg">${item.price.toLocaleString('es-CL')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link href="/store" className="font-mono text-sm uppercase tracking-widest text-gray-500 hover:text-white mt-4 w-fit transition-colors group flex items-center gap-2">
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
                                    <span className="text-white">${totalPrice().toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Envío</span>
                                    <span className="text-xs border-b border-dashed border-gray-700 pb-1">Se calcula al pagar</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-8 border-t-2 border-gray-800 pt-6">
                                <span className="text-lg">Total</span>
                                <span className="text-3xl font-bold text-white">${totalPrice().toLocaleString('es-CL')}</span>
                            </div>

                            <Link href="/checkout" className={`block w-full text-center text-lg !py-5 bg-white text-black hover:bg-transparent hover:text-white ${items.length === 0 ? 'opacity-50 pointer-events-none' : ''} transition-colors border-2 border-white`}>
                                PROCEDER AL PAGO
                            </Link>

                            <div className="mt-6 flex flex-col items-center gap-3">
                                <div className="h-[1px] w-full bg-gray-900"></div>
                                <span className="text-[10px] text-gray-600 tracking-widest text-center mt-2">
                                    PAGO 100% SEGURO
                                    <br />
                                    ENCRIPTADO VIA WEBPAY MERCADOPAGO
                                </span>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>
        </main>
    )
}