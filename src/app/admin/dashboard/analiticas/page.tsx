'use client'

import { FadeIn } from '@/components/ui/Animations'
import { useState, useEffect } from 'react'

export default function AnaliticasPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/analiticas')
            .then(res => res.json())
            .then(d => {
                setData(d)
                setLoading(false)
            })
    }, [])

    if (loading) return <div className="text-white text-center pt-32">Cargando métricas de Taller Zero...</div>

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-6xl mx-auto">
                <FadeIn>
                    <div className="border-b border-[#333] pb-6 mb-10 flex justify-between items-end">
                        <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Analíticas</h1>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Google Analytics Section */}
                    <div className="bg-[#1a1a1a] border border-[#4ade80] p-6 text-center col-span-1 md:col-span-2 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#4ade80] opacity-10 rounded-full blur-2xl"></div>
                        <h3 className="text-[#4ade80] font-mono text-xs uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse"></span>
                            Tráfico GA4 (Últimos 30 días)
                        </h3>
                        {data?.gaData?.error ? (
                            <p className="text-[#888] font-mono text-xs mb-2">{data.gaData.error}</p>
                        ) : (
                            <div className="flex justify-around items-center w-full">
                                <div>
                                    <p className="text-[#888] font-mono text-[10px] uppercase mb-1">Usuarios Activos</p>
                                    <p className="text-4xl font-bold text-white">{data?.gaData?.activeUsers?.toLocaleString('es-CL') || 0}</p>
                                </div>
                                <div className="w-px h-12 bg-[#333]"></div>
                                <div>
                                    <p className="text-[#888] font-mono text-[10px] uppercase mb-1">Vistas de Página</p>
                                    <p className="text-4xl font-bold text-white">{data?.gaData?.pageViews?.toLocaleString('es-CL') || 0}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#333] p-6 text-center flex flex-col justify-center">
                        <h3 className="text-[#888] font-mono text-xs uppercase tracking-widest mb-2">Pedidos (Total)</h3>
                        <p className="text-4xl font-bold text-white">{data?.totalOrders}</p>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#333] p-6 text-center flex flex-col justify-center">
                        <h3 className="text-[#888] font-mono text-xs uppercase tracking-widest mb-2">Ingresos (Pagados)</h3>
                        <p className="text-3xl font-bold text-[#4ade80]">${data?.totalRevenue?.toLocaleString('es-CL')}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Lo más visitado */}
                    <div className="bg-[#111] border border-[#222] p-8">
                        <h2 className="text-white font-mono uppercase tracking-widest border-b border-[#333] pb-4 mb-6">El Producto Estrella (Clicks)</h2>
                        <div className="flex flex-col items-center justify-center pt-4">
                            <span className="text-5xl border border-[#333] p-8 font-bold text-white font-mono mb-4">{data?.mostViewedProduct?.views}</span>
                            <h3 className="text-[#aaa] font-mono uppercase tracking-widest text-sm">Visualizaciones Totales</h3>
                            <p className="text-white font-bold text-2xl uppercase mt-2">{data?.mostViewedProduct?.title}</p>
                        </div>
                    </div>

                    {/* Más vendidos */}
                    <div className="bg-[#111] border border-[#222] p-8">
                        <h2 className="text-white font-mono uppercase tracking-widest border-b border-[#333] pb-4 mb-6">Ranking de Ventas</h2>
                        {data?.topSellers?.length === 0 ? (
                            <p className="text-[#888] font-mono text-sm tracking-widest">Sin datos de ventas aún.</p>
                        ) : (
                            <ul className="flex flex-col gap-4">
                                {data?.topSellers.map((ts: any, i: number) => (
                                    <li key={i} className="flex justify-between items-center text-white font-mono border-b border-[#222] pb-2">
                                        <span className="uppercase text-sm">{i + 1}. {ts.title}</span>
                                        <span className="bg-white text-black px-2 py-0.5 text-xs font-bold">{ts.quantity} vendidos</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

            </div>
        </main>
    )
}
