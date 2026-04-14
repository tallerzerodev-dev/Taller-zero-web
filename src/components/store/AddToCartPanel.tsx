'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/useCartStore'

interface AddToCartPanelProps {
    product: {
        id: string
        title: string
        price: number
        images: string[]
        category: string
        sizes: string[]
        isAvailable: boolean
        stock: number
    }
}

export function AddToCartPanel({ product }: AddToCartPanelProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const addItem = useCartStore(state => state.addItem)

    const needsSize = product.sizes.length > 0
    const canAddToCart = product.isAvailable && product.stock > 0

    const handleAddToCart = () => {
        if (needsSize && !selectedSize) {
            alert('Por favor selecciona una talla antes de añadir a tu orden.')
            return
        }

        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.images[0] || '',
            category: product.category,
            size: selectedSize || undefined,
            maxStock: product.stock
        })

        alert(`${product.title} ${selectedSize ? `(Talla ${selectedSize})` : ''} añadido al carrito.`)
    }

    return (
        <div className="mt-8">
            {/* Selector de Tallas */}
            {needsSize && (
                <div className="mb-12">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="font-mono text-[#555] uppercase text-xs tracking-[0.3em] font-bold">TALLA</h3>
                        <span className="font-mono text-[#444] text-[10px] uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Guía de medidas</span>
                    </div>
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                        {product.sizes.map(size => (
                            <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`py-4 font-mono text-sm uppercase tracking-widest border transition-all ${selectedSize === size
                                    ? 'border-white text-white bg-white/10'
                                    : 'border-[#333] text-[#888] hover:border-[#666] hover:text-white bg-transparent'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Botón de Compra */}
            <div className="mt-auto pt-6">
                <button
                    onClick={handleAddToCart}
                    className={`w-full py-6 font-mono font-bold tracking-[0.3em] uppercase text-sm md:text-base border transition-all duration-300 ${canAddToCart ? 'bg-white text-black border-white hover:bg-black hover:text-white' : 'bg-[#111] text-[#333] border-[#222] cursor-not-allowed'}`}
                    disabled={!canAddToCart}
                >
                    {canAddToCart ? 'AÑADIR AL CARRITO' : 'FUERA DE STOCK'}
                </button>
                <p className="font-mono text-[10px] text-[#444] tracking-widest text-center mt-6 uppercase">
                    Envíos procesados dentro de 2-4 días hábiles.
                </p>
            </div>
        </div>
    )
}
