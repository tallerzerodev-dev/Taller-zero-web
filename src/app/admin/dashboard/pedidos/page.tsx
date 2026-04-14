'use client'

import { FadeIn } from '@/components/ui/Animations'
import { useState, useEffect } from 'react'

export default function PedidosPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/pedidos')
            const data = await res.json()
            setOrders(data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (confirm('¿Seguro quieres cambiar el estado de este pedido?')) {
            await fetch('/api/admin/pedidos', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            })
            fetchOrders()
        }
    }

    if (loading) return <div className="text-white text-center pt-32">Cargando pedidos...</div>

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-6xl mx-auto">
                <FadeIn>
                    <div className="border-b border-[#333] pb-6 mb-10 flex justify-between items-end">
                        <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Pedidos</h1>
                    </div>
                </FadeIn>

                {orders.length === 0 ? (
                    <p className="text-[#888] font-mono text-sm tracking-widest uppercase">Aún no hay compras registradas en Taller Zero.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {orders.map(order => (
                            <div key={order.id} className="border border-[#222] bg-[#0a0a0a] p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                <div>
                                    <h3 className="text-white font-mono font-bold tracking-widest text-lg uppercase mb-1">Pedido #{order.id.slice(-6)}</h3>
                                    <p className="text-[#888] font-mono text-xs uppercase mb-2">Comprador: {order.customerName} - {order.customerEmail}</p>
                                    <p className="text-[#555] font-mono text-xs uppercase mb-4">Dirección: {order.shippingAddress || 'No especificada'}</p>

                                    <div className="flex flex-col gap-1 border-l-2 border-[#333] pl-4">
                                        {order.items.map((item: any) => (
                                            <span key={item.id} className="text-white font-mono text-sm">
                                                {item.quantity}x {item.product.title} {item.size ? `(${item.size})` : ''} - ${(item.priceAtTime * item.quantity).toLocaleString('es-CL')}
                                            </span>
                                        ))}
                                    </div>
                                    <h4 className="text-white font-mono font-bold mt-4">TOTAL Pagado: ${order.totalAmount.toLocaleString('es-CL')}</h4>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <span className="text-[#888] font-mono text-xs mb-2">Estado actual:</span>
                                    <select
                                        value={order.status}
                                        onChange={e => handleStatusChange(order.id, e.target.value)}
                                        className="p-2 bg-[#111] border border-white text-white font-mono uppercase tracking-widest text-xs font-bold"
                                    >
                                        <option value="PENDING">Pendiente / Por Pagar</option>
                                        <option value="PAID">Pagado y Empaquetando</option>
                                        <option value="SHIPPED">Enviado</option>
                                        <option value="DELIVERED">Entregado</option>
                                        <option value="CANCELLED">Cancelado / Reembolso</option>
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}
