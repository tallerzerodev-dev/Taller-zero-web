'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TierView, TierState } from '@/lib/tickets'
import { formatCLP } from '@/lib/dates'

const STATE_LABEL: Record<TierState, string> = {
    AVAILABLE: 'DISPONIBLE',
    HELD: 'EN PROCESO DE COMPRA — VUELVE EN UNOS MINUTOS',
    SOLD_OUT: 'AGOTADO',
    UPCOMING: 'PRÓXIMAMENTE',
    CLOSED: 'VENTA CERRADA',
    INFO: 'SUJETO A CAPACIDAD',
}

interface Props {
    slug: string
    tiers: TierView[]
    maxPerOrder: number
}

export function TicketSelector({ slug, tiers, maxPerOrder }: Props) {
    const router = useRouter()
    const [quantities, setQuantities] = useState<Record<string, number>>({})

    const totalQuantity = Object.values(quantities).reduce((acc, q) => acc + q, 0)
    const totalAmount = tiers.reduce((acc, t) => acc + t.price * (quantities[t.id] || 0), 0)

    const change = (tier: TierView, delta: number) => {
        setQuantities(prev => {
            const current = prev[tier.id] || 0
            const next = Math.max(0, Math.min(current + delta, tier.maxSelectable))
            // El tope por compra aplica a la suma de todos los tramos
            if (delta > 0 && totalQuantity >= maxPerOrder) return prev
            return { ...prev, [tier.id]: next }
        })
    }

    const goToCheckout = () => {
        const selection = Object.entries(quantities)
            .filter(([, q]) => q > 0)
            .map(([id, q]) => `${id}:${q}`)
            .join(',')
        router.push(`/eventos/${slug}/checkout?sel=${encodeURIComponent(selection)}`)
    }

    return (
        <div className="border border-[#333] bg-[#050505]">
            <div className="flex justify-between items-center border-b border-[#333] p-4 md:p-6">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white">Comprar Tickets</h2>
                <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest">MÁX. {maxPerOrder} POR COMPRA</span>
            </div>

            <div className="flex flex-col">
                {tiers.map(tier => {
                    const quantity = quantities[tier.id] || 0
                    const selectable = tier.state === 'AVAILABLE'
                    return (
                        <div key={tier.id} className={`border-b border-[#222] p-4 md:p-6 ${selectable ? '' : 'opacity-60'}`}>
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h3 className="text-lg font-bold uppercase tracking-widest text-white">{tier.name}</h3>
                                    <p className={`font-mono text-[10px] uppercase tracking-widest mt-1 ${tier.state === 'SOLD_OUT' ? 'text-red-500' : 'text-[#888]'}`}>
                                        {STATE_LABEL[tier.state]}
                                    </p>
                                </div>
                                <span className="font-mono text-lg text-white whitespace-nowrap">{formatCLP(tier.price)} <span className="text-[10px] text-[#888]">CLP</span></span>
                            </div>

                            {selectable && (
                                <div className="flex items-center gap-4 mt-4 font-mono">
                                    <button type="button" onClick={() => change(tier, -1)} disabled={quantity === 0} className="w-10 h-10 border border-[#333] text-white text-lg hover:border-white disabled:opacity-30" aria-label={`Quitar una entrada ${tier.name}`}>−</button>
                                    <span className="w-8 text-center text-white text-lg" aria-live="polite">{quantity}</span>
                                    <button type="button" onClick={() => change(tier, 1)} disabled={quantity >= tier.maxSelectable || totalQuantity >= maxPerOrder} className="w-10 h-10 border border-[#333] text-white text-lg hover:border-white disabled:opacity-30" aria-label={`Agregar una entrada ${tier.name}`}>+</button>
                                </div>
                            )}

                            {tier.state !== 'INFO' && tier.state !== 'UPCOMING' && (
                                <div className="w-full h-[3px] bg-[#222] mt-5" role="progressbar" aria-valuenow={tier.percentLeft} aria-valuemin={0} aria-valuemax={100} aria-label={`Entradas que quedan de ${tier.name}`}>
                                    <div className={`h-full transition-all duration-700 ${tier.low ? 'bg-red-600' : 'bg-white'}`} style={{ width: `${tier.percentLeft}%` }} />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="font-mono uppercase tracking-widest">
                    <span className="text-[10px] text-[#888] block">TOTAL</span>
                    <span className="text-2xl text-white font-bold">{formatCLP(totalAmount)}</span>
                </div>
                <button type="button" onClick={goToCheckout} disabled={totalQuantity === 0} className="bg-white text-black font-bold uppercase tracking-widest text-sm px-8 py-4 hover:bg-[#ccc] disabled:opacity-30 disabled:cursor-not-allowed">
                    CONTINUAR →
                </button>
            </div>
        </div>
    )
}
