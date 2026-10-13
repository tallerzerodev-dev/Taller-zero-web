'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/Animations'

interface SaleTicket {
    folio: number
    status: 'VALID' | 'USED' | 'CANCELLED'
    usedAt: string | null
    ticketType: { name: string }
}

interface SaleOrder {
    id: string
    buyerName: string
    buyerEmail: string
    buyerPhone: string
    status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED'
    totalAmount: number
    paymentId: string | null
    paidAt: string | null
    emailSentAt: string | null
    reviewNote: string | null
    createdAt: string
    items: { quantity: number; priceAtTime: number; ticketType: { name: string } }[]
    tickets: SaleTicket[]
}

interface SaleEvent {
    id: string
    slug: string
    title: string
    status: string
    ticketTypes: { id: string; name: string; price: number; capacity: number; sold: number; reserved: number; isInfoOnly: boolean }[]
}

const STATUS_LABEL: Record<SaleOrder['status'], { label: string; className: string }> = {
    PAID: { label: 'Pagada', className: 'border-[#4ade80] text-[#4ade80]' },
    PENDING: { label: 'Pagando', className: 'border-yellow-600 text-yellow-500' },
    CANCELLED: { label: 'Anulada', className: 'border-[#555] text-[#888]' },
    EXPIRED: { label: 'Vencida', className: 'border-[#555] text-[#888]' },
    REFUNDED: { label: 'Reembolsada', className: 'border-red-600 text-red-500' },
}

const money = (n: number) => `$${n.toLocaleString('es-CL')}`
const dateTime = (iso: string | null) => (iso ? new Date(iso).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '')

// Las celdas van entre comillas; el apóstrofo inicial evita que Excel ejecute como fórmula un nombre que empiece con = + - @
function csvCell(value: string | number): string {
    const text = String(value)
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
    return `"${safe.replace(/"/g, '""')}"`
}

export default function EventSalesPage({ params }: { params: { id: string } }) {
    const [event, setEvent] = useState<SaleEvent | null>(null)
    const [orders, setOrders] = useState<SaleOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState('')
    const [onlyReview, setOnlyReview] = useState(false)
    const [resending, setResending] = useState<string | null>(null)

    const load = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/eventos/${params.id}/ventas`)
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'No se pudieron cargar las ventas')
            setEvent(data.event)
            setOrders(data.orders)
            setError('')
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [params.id])

    useEffect(() => {
        load()
    }, [load])

    const paidOrders = useMemo(() => orders.filter(o => o.status === 'PAID'), [orders])
    const revenue = paidOrders.reduce((acc, o) => acc + o.totalAmount, 0)
    const allTickets = useMemo(() => orders.flatMap(o => o.tickets), [orders])
    const liveTickets = allTickets.filter(t => t.status !== 'CANCELLED').length
    const admitted = allTickets.filter(t => t.status === 'USED').length
    const needReview = orders.filter(o => o.reviewNote).length

    const visible = useMemo(() => {
        const term = filter.trim().toLowerCase()
        return orders.filter(o =>
            (!onlyReview || o.reviewNote) &&
            (!term || o.buyerEmail.toLowerCase().includes(term) || o.buyerName.toLowerCase().includes(term) || o.id.toLowerCase().endsWith(term))
        )
    }, [orders, filter, onlyReview])

    const resend = async (orderId: string) => {
        setResending(orderId)
        try {
            const res = await fetch(`/api/admin/eventos/${params.id}/ventas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId }),
            })
            const data = await res.json().catch(() => ({}))
            alert(res.ok ? 'Correo reenviado.' : data.error || 'No se pudo reenviar.')
            if (res.ok) load()
        } finally {
            setResending(null)
        }
    }

    const exportCsv = () => {
        const rows = [['Folio', 'Tramo', 'Estado', 'Ingreso', 'Comprador', 'Correo', 'Teléfono', 'Orden']]
        for (const order of paidOrders) {
            for (const ticket of order.tickets) {
                rows.push([
                    String(ticket.folio),
                    ticket.ticketType.name,
                    ticket.status === 'USED' ? 'Ingresó' : ticket.status === 'VALID' ? 'Válida' : 'Anulada',
                    dateTime(ticket.usedAt),
                    order.buyerName,
                    order.buyerEmail,
                    order.buyerPhone,
                    order.id.slice(-6).toUpperCase(),
                ])
            }
        }
        const csv = '﻿' + rows.map(row => row.map(csvCell).join(';')).join('\r\n')
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
        const link = document.createElement('a')
        link.href = url
        link.download = `asistentes-${event?.slug || 'evento'}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    if (loading) return <div className="text-white text-center pt-32">Cargando ventas...</div>
    if (error || !event) return <div className="text-red-500 font-mono text-center pt-32 uppercase tracking-widest">{error || 'Evento no encontrado'}</div>

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-6xl mx-auto">
                <FadeIn>
                    <div className="border-b border-[#333] pb-6 mb-10 flex flex-col md:flex-row justify-between md:items-end gap-4">
                        <div>
                            <Link href="/admin/dashboard/eventos" className="font-mono text-[10px] text-[#555] hover:text-white uppercase tracking-[0.3em]">← Eventos</Link>
                            <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mt-2">{event.title}</h1>
                            <p className="font-mono text-xs uppercase tracking-widest text-[#888] mt-2">Ventas de entradas</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={load} className="text-xs uppercase border border-[#555] text-white px-4 py-2 font-mono tracking-widest hover:border-white">Actualizar</button>
                            <button onClick={exportCsv} disabled={paidOrders.length === 0} className="text-xs uppercase bg-white text-black px-4 py-2 font-mono tracking-widest disabled:opacity-40">Exportar asistentes</button>
                        </div>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 font-mono uppercase tracking-widest">
                    {[
                        ['Recaudado', money(revenue)],
                        ['Entradas vendidas', String(liveTickets)],
                        ['Ingresados', `${admitted} / ${liveTickets}`],
                        ['Por revisar', String(needReview)],
                    ].map(([label, value]) => (
                        <div key={label} className="border border-[#222] bg-[#0a0a0a] p-4">
                            <p className="text-[10px] text-[#888] mb-2">{label}</p>
                            <p className={`text-2xl font-bold ${label === 'Por revisar' && needReview > 0 ? 'text-red-500' : 'text-white'}`}>{value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {event.ticketTypes.filter(t => !t.isInfoOnly).map(tier => (
                        <div key={tier.id} className="border border-[#222] p-4 font-mono uppercase tracking-widest">
                            <p className="text-white text-sm font-bold">{tier.name}</p>
                            <p className="text-[10px] text-[#888] mt-1">{money(tier.price)}</p>
                            <div className="w-full h-[3px] bg-[#222] mt-3">
                                <div className="h-full bg-white" style={{ width: `${tier.capacity > 0 ? Math.min(100, (tier.sold / tier.capacity) * 100) : 0}%` }} />
                            </div>
                            <p className="text-[10px] text-[#888] mt-2">{tier.sold} vendidas · {tier.reserved} pagando · cupo {tier.capacity}</p>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <label htmlFor="sales-filter" className="sr-only">Buscar orden</label>
                    <input id="sales-filter" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar por nombre, correo o número de orden" className="flex-1 bg-[#111] border border-[#333] text-white p-3 font-mono text-sm" />
                    <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#888] border border-[#333] px-4 cursor-pointer">
                        <input type="checkbox" checked={onlyReview} onChange={e => setOnlyReview(e.target.checked)} />
                        Solo por revisar
                    </label>
                </div>

                <div className="flex flex-col gap-4">
                    {visible.map(order => {
                        const status = STATUS_LABEL[order.status]
                        return (
                            <div key={order.id} className="border border-[#222] bg-[#0a0a0a] p-4">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="font-mono">
                                        <span className={`text-[10px] uppercase tracking-widest border px-2 py-0.5 inline-block mb-2 ${status.className}`}>{status.label}</span>
                                        <p className="text-white font-bold uppercase tracking-widest">#{order.id.slice(-6).toUpperCase()} · {order.buyerName}</p>
                                        <p className="text-[#888] text-xs mt-1">{order.buyerEmail} · {order.buyerPhone}</p>
                                        <p className="text-[#888] text-[10px] uppercase tracking-widest mt-2">
                                            {order.items.map(i => `${i.quantity} × ${i.ticketType.name}`).join(' + ')} · {money(order.totalAmount)}
                                        </p>
                                        <p className="text-[#555] text-[10px] uppercase tracking-widest mt-1">
                                            Creada {dateTime(order.createdAt)}{order.paidAt ? ` · Pagada ${dateTime(order.paidAt)}` : ''}{order.paymentId ? ` · Pago MP ${order.paymentId}` : ''}
                                        </p>
                                    </div>
                                    {order.status === 'PAID' && order.tickets.length > 0 && (
                                        <button onClick={() => resend(order.id)} disabled={resending === order.id} className="text-[10px] uppercase border border-[#555] text-white px-3 py-2 font-mono tracking-widest hover:border-white disabled:opacity-50 whitespace-nowrap self-start">
                                            {resending === order.id ? 'Enviando...' : order.emailSentAt ? 'Reenviar correo' : 'Enviar correo'}
                                        </button>
                                    )}
                                </div>

                                {order.reviewNote && (
                                    <p className="text-red-400 border border-red-900 bg-red-950/30 font-mono text-xs uppercase p-2 mt-3">Revisar: {order.reviewNote}</p>
                                )}

                                {order.tickets.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3 font-mono text-[10px] uppercase tracking-widest">
                                        {order.tickets.map(ticket => (
                                            <span key={ticket.folio} className={`border px-2 py-1 ${ticket.status === 'USED' ? 'border-[#4ade80] text-[#4ade80]' : ticket.status === 'CANCELLED' ? 'border-red-900 text-red-500 line-through' : 'border-[#333] text-[#888]'}`}>
                                                {String(ticket.folio).padStart(4, '0')} {ticket.ticketType.name}{ticket.status === 'USED' ? ` · ingresó ${dateTime(ticket.usedAt)}` : ''}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                    {visible.length === 0 && <p className="text-[#666] font-mono text-sm">No hay órdenes que mostrar.</p>}
                </div>
            </div>
        </main>
    )
}
