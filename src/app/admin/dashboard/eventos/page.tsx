'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FadeIn } from '@/components/ui/Animations'

interface Tier {
    id?: string
    name: string
    price: number
    capacity: number
    sortOrder: number
    salesStart: string // valor de <input type="datetime-local">, '' si no aplica
    salesEnd: string
    isActive: boolean
    isInfoOnly: boolean
    sold: number
    reserved: number
}

interface EventRow {
    id: string
    slug: string
    title: string
    description: string | null
    startsAt: string
    venueName: string
    venueAddress: string | null
    coverImage: string | null
    lineup: string[]
    tags: string[]
    minAge: number | null
    maxPerOrder: number
    status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED'
    ticketTypes: (Omit<Tier, 'salesStart' | 'salesEnd'> & { id: string; salesStart: string | null; salesEnd: string | null })[]
    _count: { tickets: number }
}

const inputClass = 'w-full bg-[#111] border border-[#333] text-white p-2 font-mono text-sm'
const labelClass = 'text-xs uppercase font-mono text-[#888] tracking-widest block mb-1'

// <input type="datetime-local"> trabaja en la hora del navegador; la base guarda UTC.
function toLocalInput(iso: string | null): string {
    if (!iso) return ''
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromLocalInput(value: string): string | null {
    return value ? new Date(value).toISOString() : null
}

const emptyTier = (sortOrder: number): Tier => ({
    name: '', price: 0, capacity: 0, sortOrder, salesStart: '', salesEnd: '', isActive: true, isInfoOnly: false, sold: 0, reserved: 0,
})

export default function EventosAdminPage() {
    const [events, setEvents] = useState<EventRow[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [editing, setEditing] = useState<EventRow | null>(null)

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startsAt, setStartsAt] = useState('')
    const [venueName, setVenueName] = useState('')
    const [venueAddress, setVenueAddress] = useState('')
    const [coverImage, setCoverImage] = useState('')
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [lineup, setLineup] = useState('')
    const [tags, setTags] = useState('')
    const [minAge, setMinAge] = useState('')
    const [maxPerOrder, setMaxPerOrder] = useState(6)
    const [published, setPublished] = useState(false)
    const [tiers, setTiers] = useState<Tier[]>([emptyTier(0)])

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/admin/eventos')
            const data = await res.json()
            if (Array.isArray(data)) setEvents(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    const resetForm = () => {
        setEditing(null)
        setTitle(''); setDescription(''); setStartsAt(''); setVenueName(''); setVenueAddress(''); setCoverImage(''); setCoverFile(null)
        setLineup(''); setTags(''); setMinAge(''); setMaxPerOrder(6); setPublished(false)
        setTiers([emptyTier(0)])
        setMessage('')
    }

    const editEvent = (ev: EventRow) => {
        setEditing(ev)
        setTitle(ev.title)
        setDescription(ev.description || '')
        setStartsAt(toLocalInput(ev.startsAt))
        setVenueName(ev.venueName)
        setVenueAddress(ev.venueAddress || '')
        setCoverImage(ev.coverImage || '')
        setCoverFile(null)
        setLineup(ev.lineup.join('\n'))
        setTags(ev.tags.join(', '))
        setMinAge(ev.minAge ? String(ev.minAge) : '')
        setMaxPerOrder(ev.maxPerOrder)
        setPublished(ev.status === 'PUBLISHED')
        setTiers(ev.ticketTypes.map(t => ({ ...t, salesStart: toLocalInput(t.salesStart), salesEnd: toLocalInput(t.salesEnd) })))
        setMessage('')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const updateTier = (index: number, patch: Partial<Tier>) => {
        setTiers(prev => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)))
    }

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setCoverFile(file)
            setCoverImage(URL.createObjectURL(file)) // solo para la vista previa
        }
        e.target.value = ''
    }

    // Reduce la portada en el navegador antes de subirla (evita el límite de 4.5MB de Vercel)
    const compressCover = async (file: File, maxWidth = 1600, quality = 0.85): Promise<Blob> => {
        let bitmap: ImageBitmap
        try {
            bitmap = await createImageBitmap(file)
        } catch {
            throw new Error('No se pudo leer la imagen de portada. Vuelve a elegir el archivo (si lo moviste o editaste después de seleccionarlo, el navegador ya no puede leerlo).')
        }
        const scale = Math.min(1, maxWidth / bitmap.width)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(bitmap.width * scale)
        canvas.height = Math.round(bitmap.height * scale)
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
        bitmap.close()
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality))
        if (!blob) throw new Error('No se pudo procesar la imagen de portada.')
        return blob
    }

    // Devuelve la URL final de la portada: sube el archivo nuevo si se eligió uno
    const uploadCover = async (): Promise<string> => {
        if (!coverFile) return coverImage.startsWith('blob:') ? '' : coverImage

        const formData = new FormData()
        formData.append('file', await compressCover(coverFile), 'evento.jpg')

        let uploadRes: Response
        try {
            uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        } catch {
            throw new Error('No se pudo conectar con el servidor para subir la portada. Revisa que el sitio siga corriendo.')
        }
        const data = await uploadRes.json().catch(() => ({}))
        if (!uploadRes.ok || !data.url) throw new Error(data.error || `No se pudo subir la portada (error ${uploadRes.status})`)
        return data.url as string
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage('')
        try {
            const payload = {
                id: editing?.id,
                title,
                description,
                startsAt: fromLocalInput(startsAt),
                venueName,
                venueAddress,
                coverImage: await uploadCover(),
                lineup: lineup.split('\n').map(s => s.trim()).filter(Boolean),
                tags: tags.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean),
                minAge: minAge ? Number(minAge) : null,
                maxPerOrder,
                status: published ? 'PUBLISHED' : 'DRAFT',
                ticketTypes: tiers.filter(t => t.name.trim()).map((t, i) => ({
                    id: t.id,
                    name: t.name,
                    price: t.price,
                    capacity: t.capacity,
                    sortOrder: i,
                    salesStart: fromLocalInput(t.salesStart),
                    salesEnd: fromLocalInput(t.salesEnd),
                    isActive: t.isActive,
                    isInfoOnly: t.isInfoOnly,
                })),
            }

            let res: Response
            try {
                res = await fetch('/api/admin/eventos', {
                    method: editing ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                })
            } catch {
                throw new Error('No se pudo conectar con el servidor para guardar el evento. Revisa que el sitio siga corriendo.')
            }
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.error || 'No se pudo guardar el evento')

            resetForm()
            setMessage('EVENTO GUARDADO.')
            fetchEvents()
        } catch (err: any) {
            setMessage(err.message || 'Ocurrió un error al guardar el evento.')
        } finally {
            setSaving(false)
        }
    }

    const cancelEvent = async (ev: EventRow) => {
        if (!confirm(`¿Cancelar "${ev.title}"? Se corta la venta y se anulan todas las entradas. Los reembolsos se hacen en Mercado Pago. No se puede deshacer.`)) return
        const res = await fetch('/api/admin/eventos', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ev.id, action: 'cancel' }),
        })
        if (!res.ok) alert('No se pudo cancelar el evento.')
        if (editing?.id === ev.id) resetForm()
        fetchEvents()
    }

    const deleteEvent = async (ev: EventRow) => {
        if (!confirm(`¿Eliminar "${ev.title}"?`)) return
        const res = await fetch('/api/admin/eventos?id=' + ev.id, { method: 'DELETE' })
        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            alert(data.error || 'No se pudo eliminar el evento.')
        }
        if (editing?.id === ev.id) resetForm()
        fetchEvents()
    }

    if (loading) return <div className="text-white text-center pt-32">Cargando eventos...</div>

    return (
        <main className="flex-1 flex flex-col bg-black min-h-screen px-6 py-24">
            <div className="w-full max-w-7xl mx-auto">
                <FadeIn>
                    <div className="border-b border-[#333] pb-6 mb-10 flex justify-between items-end gap-4">
                        <div>
                            <Link href="/admin/dashboard" className="font-mono text-[10px] text-[#555] hover:text-white uppercase tracking-[0.3em]">← Panel</Link>
                            <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mt-2">Eventos & Tickets</h1>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/admin/puerta" className="text-xs uppercase border border-white text-white px-4 py-2 font-mono tracking-widest hover:bg-white hover:text-black">Puerta</Link>
                            <button onClick={resetForm} className="text-xs uppercase bg-white text-black px-4 py-2 font-mono tracking-widest">+ Nuevo Evento</button>
                        </div>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Formulario */}
                    <div className="lg:col-span-3">
                        <div className="border border-[#333] bg-[#0a0a0a] p-6">
                            <h2 className="text-lg text-white font-mono uppercase tracking-widest mb-6">{editing ? 'Editar Evento' : 'Crear Evento'}</h2>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor="ev-title" className={labelClass}>Nombre del evento</label>
                                    <input id="ev-title" required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="ev-start" className={labelClass}>Fecha y hora de inicio</label>
                                        <input id="ev-start" required type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="ev-age" className={labelClass}>Edad mínima</label>
                                            <input id="ev-age" type="number" min="0" max="99" value={minAge} onChange={e => setMinAge(e.target.value)} className={inputClass} placeholder="—" />
                                        </div>
                                        <div>
                                            <label htmlFor="ev-max" className={labelClass}>Máx. por compra</label>
                                            <input id="ev-max" required type="number" min="1" max="20" value={maxPerOrder} onChange={e => setMaxPerOrder(Number(e.target.value))} className={inputClass} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="ev-venue" className={labelClass}>Recinto</label>
                                        <input id="ev-venue" required value={venueName} onChange={e => setVenueName(e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="ev-address" className={labelClass}>Dirección</label>
                                        <input id="ev-address" value={venueAddress} onChange={e => setVenueAddress(e.target.value)} className={inputClass} />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="ev-desc" className={labelClass}>Acerca del evento</label>
                                    <textarea id="ev-desc" rows={5} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="ev-lineup" className={labelClass}>Lineup (uno por línea)</label>
                                        <textarea id="ev-lineup" rows={4} value={lineup} onChange={e => setLineup(e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <label htmlFor="ev-tags" className={labelClass}>Etiquetas (separadas por coma)</label>
                                        <input id="ev-tags" value={tags} onChange={e => setTags(e.target.value)} className={inputClass} placeholder="techno, fiesta" />

                                        <label htmlFor="ev-cover" className={`${labelClass} mt-4`}>Portada</label>
                                        {coverImage && <img src={coverImage} alt="Portada" className="w-full h-32 object-cover bg-[#111] border border-[#333] mb-2" />}
                                        <input id="ev-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="w-full text-xs text-[#888] font-mono file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-mono file:bg-white file:text-black cursor-pointer" />
                                    </div>
                                </div>

                                {/* Tramos */}
                                <div className="border-t border-[#333] pt-6 mt-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm text-white font-mono uppercase tracking-widest">Tramos de venta</h3>
                                        <button type="button" onClick={() => setTiers(prev => [...prev, emptyTier(prev.length)])} className="text-[10px] uppercase border border-[#555] text-white px-3 py-1 font-mono tracking-widest hover:border-white">+ Tramo</button>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {tiers.map((tier, i) => {
                                            const committed = tier.sold + tier.reserved
                                            return (
                                                <div key={tier.id || `new-${i}`} className="border border-[#222] bg-black p-4">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        <div className="col-span-2">
                                                            <label className={labelClass}>Nombre</label>
                                                            <input value={tier.name} onChange={e => updateTier(i, { name: e.target.value })} className={inputClass} placeholder="Preventa 1" />
                                                        </div>
                                                        <div>
                                                            <label className={labelClass}>Precio (CLP)</label>
                                                            <input type="number" min="0" value={tier.price} onChange={e => updateTier(i, { price: Number(e.target.value) })} className={inputClass} />
                                                        </div>
                                                        <div>
                                                            <label className={labelClass}>Cupo</label>
                                                            <div className="flex">
                                                                <button type="button" onClick={() => updateTier(i, { capacity: Math.max(committed, tier.capacity - 10) })} className="border border-[#333] text-white px-2 font-mono text-sm hover:border-white" aria-label="Quitar 10 de cupo">−</button>
                                                                <input type="number" min={committed} value={tier.capacity} onChange={e => updateTier(i, { capacity: Number(e.target.value) })} className={`${inputClass} text-center border-x-0`} />
                                                                <button type="button" onClick={() => updateTier(i, { capacity: tier.capacity + 10 })} className="border border-[#333] text-white px-2 font-mono text-sm hover:border-white" aria-label="Sumar 10 de cupo">+</button>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className={labelClass}>Venta desde (opcional)</label>
                                                            <input type="datetime-local" value={tier.salesStart} onChange={e => updateTier(i, { salesStart: e.target.value })} className={inputClass} />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className={labelClass}>Venta hasta (opcional)</label>
                                                            <input type="datetime-local" value={tier.salesEnd} onChange={e => updateTier(i, { salesEnd: e.target.value })} className={inputClass} />
                                                        </div>
                                                    </div>

                                                    {tier.id && !tier.isInfoOnly && (
                                                        <div className="mt-4">
                                                            <div className="w-full h-[3px] bg-[#222]">
                                                                <div className="h-full bg-white" style={{ width: `${tier.capacity > 0 ? Math.min(100, (tier.sold / tier.capacity) * 100) : 0}%` }} />
                                                            </div>
                                                            <p className="font-mono text-[10px] text-[#888] uppercase tracking-widest mt-2">
                                                                Vendidas {tier.sold} · En proceso de pago {tier.reserved} · Disponibles {Math.max(0, tier.capacity - committed)} de {tier.capacity}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-6 mt-4 font-mono text-[10px] uppercase tracking-widest text-[#888]">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="checkbox" checked={tier.isActive} onChange={e => updateTier(i, { isActive: e.target.checked })} />
                                                            A la venta
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input type="checkbox" checked={tier.isInfoOnly} onChange={e => updateTier(i, { isInfoOnly: e.target.checked })} />
                                                            Solo informativo (ej: Puerta)
                                                        </label>
                                                        <div className="flex gap-3 ml-auto">
                                                            {i > 0 && (
                                                                <button type="button" onClick={() => setTiers(prev => { const next = [...prev];[next[i - 1], next[i]] = [next[i], next[i - 1]]; return next })} className="hover:text-white">↑ Subir</button>
                                                            )}
                                                            <button type="button" onClick={() => setTiers(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-400">Quitar</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-white border border-[#333] p-3 cursor-pointer">
                                    <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
                                    Publicado (visible en el sitio y a la venta)
                                </label>

                                {message && <p className="font-mono text-xs uppercase tracking-widest text-white border border-[#555] p-3">{message}</p>}

                                <button type="submit" disabled={saving} className="bg-white text-black font-bold uppercase tracking-widest text-sm px-6 py-4 hover:bg-[#ccc] disabled:opacity-50">
                                    {saving ? 'GUARDANDO...' : editing ? 'GUARDAR CAMBIOS' : 'CREAR EVENTO'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Listado */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xl text-white font-mono uppercase tracking-widest mb-6 border-b border-[#333] pb-2">Tus Eventos</h2>
                        <div className="flex flex-col gap-6">
                            {events.map(ev => {
                                const sold = ev.ticketTypes.reduce((acc, t) => acc + t.sold, 0)
                                const capacity = ev.ticketTypes.filter(t => !t.isInfoOnly).reduce((acc, t) => acc + t.capacity, 0)
                                return (
                                    <div key={ev.id} className="border border-[#222] bg-[#0a0a0a] p-4">
                                        {ev.coverImage && (
                                            <div className="w-full h-32 relative bg-[#111] mb-4">
                                                <Image src={ev.coverImage} alt={ev.title} fill className="object-cover grayscale" sizes="400px" />
                                            </div>
                                        )}
                                        <span className={`text-[10px] uppercase tracking-widest inline-block border px-2 py-0.5 mb-2 font-mono ${ev.status === 'PUBLISHED' ? 'border-[#4ade80] text-[#4ade80]' : ev.status === 'CANCELLED' ? 'border-red-600 text-red-500' : 'border-[#555] text-[#888]'}`}>
                                            {ev.status === 'PUBLISHED' ? 'Publicado' : ev.status === 'CANCELLED' ? 'Cancelado' : 'Borrador'}
                                        </span>
                                        <h3 className="text-white font-bold uppercase tracking-widest leading-tight">{ev.title}</h3>
                                        <p className="text-[#888] font-mono text-xs mt-1">{new Date(ev.startsAt).toLocaleString('es-CL', { dateStyle: 'medium', timeStyle: 'short' })} · {ev.venueName}</p>
                                        <p className="text-white font-mono text-xs mt-2 uppercase tracking-widest">Vendidas: {sold} / {capacity}</p>
                                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[#222] font-mono text-xs uppercase tracking-widest">
                                            {ev.status !== 'CANCELLED' && <button onClick={() => editEvent(ev)} className="text-white hover:text-[#bbb]">Editar</button>}
                                            <Link href={`/admin/dashboard/eventos/${ev.id}`} className="text-white hover:text-[#bbb]">Ventas</Link>
                                            {ev.status === 'PUBLISHED' && <Link href={`/eventos/${ev.slug}`} className="text-white hover:text-[#bbb]" target="_blank">Ver</Link>}
                                            {ev.status !== 'CANCELLED' && <button onClick={() => cancelEvent(ev)} className="text-red-500 hover:text-red-400 ml-auto">Cancelar</button>}
                                            {ev._count.tickets === 0 && <button onClick={() => deleteEvent(ev)} className="text-red-500 hover:text-red-400">Borrar</button>}
                                        </div>
                                    </div>
                                )
                            })}
                            {events.length === 0 && <p className="text-[#666] font-mono text-sm">Todavía no hay eventos.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
