'use client'

import { FadeIn } from '@/components/ui/Animations'
import { useState, useEffect } from 'react'

export default function PedidosPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showPending, setShowPending] = useState(false)
    const [trackingInputs, setTrackingInputs] = useState<{ [key: string]: { trackingNumber: string, trackingCompany: string } }>({})

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/pedidos')
            const data = await res.json()
            setOrders(data)
            
            // Initialize tracking inputs for each order
            const initialInputs: any = {}
            data.forEach((order: any) => {
                initialInputs[order.id] = {
                    trackingNumber: order.trackingNumber || '',
                    trackingCompany: order.trackingCompany || ''
                }
            })
            setTrackingInputs(initialInputs)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (confirm('¿Seguro quieres cambiar el estado de este pedido? Si marcas "Enviado", se le notificará al cliente.')) {
            const tracking = trackingInputs[id]
            await fetch('/api/admin/pedidos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id, 
                    status: newStatus,
                    trackingNumber: tracking.trackingNumber,
                    trackingCompany: tracking.trackingCompany
                })
            })
            fetchOrders()
        }
    }

    const handleTrackingChange = (id: string, field: string, value: string) => {
        setTrackingInputs(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value
            }
        }))
    }

    if (loading) return <div className="text-white text-center pt-32">Cargando pedidos...</div>

    const filteredOrders = showPending ? orders : orders.filter(o => o.status !== 'PENDING')

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-6xl mx-auto">
                <FadeIn>
                    <div className="border-b border-[#333] pb-6 mb-10 flex justify-between items-end">
                        <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Pedidos</h1>
                        <button 
                            onClick={() => setShowPending(!showPending)}
                            className="text-xs font-mono uppercase tracking-widest text-[#888] hover:text-white border border-[#333] px-4 py-2"
                        >
                            {showPending ? 'Ocultar Abandonados' : 'Mostrar Abandonados (PENDING)'}
                        </button>
                    </div>
                </FadeIn>

                {filteredOrders.length === 0 ? (
                    <p className="text-[#888] font-mono text-sm tracking-widest uppercase">No hay pedidos para mostrar.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="border border-[#222] bg-[#0a0a0a] p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                <div className="flex-1">
                                    <h3 className="text-white font-mono font-bold tracking-widest text-lg uppercase mb-1 flex items-center gap-3">
                                        Pedido #{order.id.slice(-6)}
                                        {order.status === 'PENDING' && <span className="bg-yellow-900 text-yellow-300 text-[10px] px-2 py-1">Abandonado</span>}
                                        {order.status === 'PAID' && <span className="bg-green-900 text-green-300 text-[10px] px-2 py-1">Pagado</span>}
                                        {order.status === 'SHIPPED' && <span className="bg-blue-900 text-blue-300 text-[10px] px-2 py-1">Enviado</span>}
                                    </h3>
                                    <p className="text-[#888] font-mono text-xs uppercase mb-2">Comprador: {order.customerName} - {order.customerEmail}</p>
                                    <p className="text-[#555] font-mono text-xs uppercase mb-4">Dirección: {order.shippingAddress || 'No especificada'}</p>

                                    <div className="flex flex-col gap-1 border-l-2 border-[#333] pl-4 mb-4">
                                        {order.items.map((item: any) => (
                                            <span key={item.id} className="text-white font-mono text-sm">
                                                {item.quantity}x {item.product.title} {item.size ? `(${item.size})` : ''} - ${(item.priceAtTime * item.quantity).toLocaleString('es-CL')}
                                            </span>
                                        ))}
                                    </div>
                                    <h4 className="text-white font-mono font-bold">TOTAL Pagado: ${order.totalAmount.toLocaleString('es-CL')}</h4>
                                </div>

                                <div className="flex flex-col items-end gap-3 w-full md:w-auto bg-[#111] p-4 border border-[#222]">
                                    <div className="w-full">
                                        <span className="text-[#888] font-mono text-xs mb-1 block">Estado actual:</span>
                                        <select
                                            value={order.status}
                                            onChange={e => handleStatusChange(order.id, e.target.value)}
                                            className="w-full p-2 bg-black border border-[#333] text-white font-mono uppercase tracking-widest text-xs font-bold focus:border-white outline-none transition-colors"
                                        >
                                            <option value="PENDING">Pendiente / Abandonado</option>
                                            <option value="PAID">Pagado (Por enviar)</option>
                                            <option value="SHIPPED">Enviado</option>
                                            <option value="DELIVERED">Entregado</option>
                                            <option value="CANCELLED">Cancelado</option>
                                        </select>
                                    </div>

                                    {(order.status === 'PAID' || order.status === 'SHIPPED') && (
                                        <div className="w-full space-y-2 mt-2 pt-2 border-t border-[#222]">
                                            <div>
                                                <span className="text-[#888] font-mono text-[10px] block uppercase mb-1">Empresa de Envío</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Ej: Starken"
                                                    value={trackingInputs[order.id]?.trackingCompany || ''}
                                                    onChange={e => handleTrackingChange(order.id, 'trackingCompany', e.target.value)}
                                                    className="w-full p-2 bg-black border border-[#333] text-white font-mono text-xs focus:border-[#666] outline-none"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[#888] font-mono text-[10px] block uppercase mb-1">Número de Seguimiento</span>
                                                <input 
                                                    type="text" 
                                                    placeholder="Ej: 123456789"
                                                    value={trackingInputs[order.id]?.trackingNumber || ''}
                                                    onChange={e => handleTrackingChange(order.id, 'trackingNumber', e.target.value)}
                                                    className="w-full p-2 bg-black border border-[#333] text-white font-mono text-xs focus:border-[#666] outline-none"
                                                />
                                            </div>
                                            {order.status === 'PAID' && (
                                                <button 
                                                    onClick={() => handleStatusChange(order.id, 'SHIPPED')}
                                                    className="w-full p-2 bg-white text-black font-mono text-xs font-bold uppercase hover:bg-gray-200 mt-2"
                                                >
                                                    Guardar y Marcar Enviado
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
