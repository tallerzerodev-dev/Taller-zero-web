'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { scanEntry, getDoorStats, searchEntries, type ScanOutcome, type DoorStats, type EntrySearchResult } from './actions'

interface EventOption {
    id: string
    title: string
    dateLabel: string
}

const VERDICT: Record<ScanOutcome['result'], { title: string; className: string }> = {
    OK: { title: 'INGRESO VÁLIDO', className: 'bg-[#002a0f] border-[#4ade80] text-[#4ade80]' },
    ALREADY_USED: { title: 'YA USADA', className: 'bg-[#3a0000] border-red-600 text-red-400' },
    CANCELLED: { title: 'ENTRADA ANULADA', className: 'bg-[#3a0000] border-red-600 text-red-400' },
    WRONG_EVENT: { title: 'OTRO EVENTO', className: 'bg-[#3a0000] border-red-600 text-red-400' },
    NOT_FOUND: { title: 'QR NO RECONOCIDO', className: 'bg-[#3a0000] border-red-600 text-red-400' },
}

const SCAN_INTERVAL_MS = 250
// Evita validar dos veces el mismo QR mientras sigue frente a la cámara
const SAME_CODE_COOLDOWN_MS = 4000
// Ancho al que se reduce cada cuadro antes de buscar el QR: suficiente para leerlo y liviano para el teléfono
const SCAN_WIDTH = 640

export function DoorScanner({ events }: { events: EventOption[] }) {
    const [eventId, setEventId] = useState(events[0]?.id ?? '')
    const [cameraOn, setCameraOn] = useState(false)
    const [cameraError, setCameraError] = useState('')
    const [outcome, setOutcome] = useState<ScanOutcome | null>(null)
    const [stats, setStats] = useState<DoorStats | null>(null)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<EntrySearchResult[]>([])
    const [searching, setSearching] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const busyRef = useRef(false)
    const lastScanRef = useRef({ code: '', at: 0 })
    const eventIdRef = useRef(eventId)
    eventIdRef.current = eventId

    const refreshStats = useCallback(async () => {
        if (!eventIdRef.current) return
        try {
            setStats(await getDoorStats(eventIdRef.current))
        } catch {
            // Sin conexión momentánea: el contador se actualiza en el próximo escaneo
        }
    }, [])

    const submit = useCallback(async (raw: string) => {
        if (busyRef.current || !eventIdRef.current) return
        busyRef.current = true
        try {
            const result = await scanEntry(raw, eventIdRef.current)
            setOutcome(result)
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate(result.result === 'OK' ? 80 : [120, 60, 120])
            }
            await refreshStats()
        } catch {
            setOutcome({ result: 'NOT_FOUND', kind: null, detail: 'Sin conexión o sesión vencida. Vuelve a intentar.' })
        } finally {
            busyRef.current = false
        }
    }, [refreshStats])

    useEffect(() => {
        setOutcome(null)
        setResults([])
        refreshStats()
    }, [eventId, refreshStats])

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(track => track.stop())
        streamRef.current = null
        setCameraOn(false)
    }, [])

    const startCamera = async () => {
        setCameraError('')
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                await videoRef.current.play()
            }
            setCameraOn(true)
        } catch {
            setCameraError('No se pudo abrir la cámara. Revisa el permiso del navegador o usa la búsqueda manual.')
        }
    }

    useEffect(() => stopCamera, [stopCamera])

    // Lee un cuadro del video cada cierto tiempo y busca un QR
    useEffect(() => {
        if (!cameraOn) return
        const interval = setInterval(() => {
            const video = videoRef.current
            const canvas = canvasRef.current
            if (!video || !canvas || video.readyState < 2 || busyRef.current || video.videoWidth === 0) return

            const scale = Math.min(1, SCAN_WIDTH / video.videoWidth)
            canvas.width = Math.round(video.videoWidth * scale)
            canvas.height = Math.round(video.videoHeight * scale)
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (!ctx) return
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const found = jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })
            if (!found?.data) return

            const now = Date.now()
            if (found.data === lastScanRef.current.code && now - lastScanRef.current.at < SAME_CODE_COOLDOWN_MS) return
            lastScanRef.current = { code: found.data, at: now }
            submit(found.data)
        }, SCAN_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [cameraOn, submit])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setSearching(true)
        try {
            setResults(await searchEntries(eventId, query))
        } finally {
            setSearching(false)
        }
    }

    const admitFromSearch = async (code: string) => {
        await submit(code)
        setResults(await searchEntries(eventId, query))
    }

    if (events.length === 0) {
        return <p className="font-mono text-sm uppercase tracking-widest text-[#888] border border-[#333] p-6">No hay eventos publicados para validar.</p>
    }

    const verdict = outcome ? VERDICT[outcome.result] : null

    return (
        <div className="flex flex-col gap-6">
            <div>
                <label htmlFor="door-event" className="font-mono text-xs uppercase tracking-widest text-[#888] block mb-1">Evento</label>
                <select id="door-event" value={eventId} onChange={e => setEventId(e.target.value)} className="w-full bg-[#111] border border-[#333] text-white p-3 font-mono text-sm uppercase">
                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title} — {ev.dateLabel}</option>)}
                </select>
            </div>

            <div className="border border-[#333] bg-[#0a0a0a] p-4 flex justify-between items-center font-mono uppercase tracking-widest">
                <span className="text-xs text-[#888]">Ingresados</span>
                <span className="text-2xl text-white font-bold">{stats ? `${stats.admitted} / ${stats.total}` : '— / —'}</span>
            </div>

            {/* Resultado del último escaneo */}
            <div aria-live="assertive" className={`border-2 p-6 text-center min-h-[160px] flex flex-col justify-center ${verdict ? verdict.className : 'border-[#333] bg-[#050505] text-[#555]'}`}>
                {outcome && verdict ? (
                    <>
                        <p className="text-3xl font-bold uppercase tracking-tighter">{verdict.title}</p>
                        {outcome.name && <p className="text-white font-bold text-xl uppercase mt-3">{outcome.name}</p>}
                        {outcome.detail && <p className="font-mono text-xs uppercase tracking-widest text-white/80 mt-2">{outcome.detail}</p>}
                        {outcome.result === 'ALREADY_USED' && outcome.usedAt && (
                            <p className="font-mono text-[10px] uppercase tracking-widest mt-3">Usada: {outcome.usedAt}{outcome.usedBy ? ` · ${outcome.usedBy}` : ''}</p>
                        )}
                    </>
                ) : (
                    <p className="font-mono text-xs uppercase tracking-widest">Apunta la cámara al código QR</p>
                )}
            </div>

            {/* Cámara */}
            <div className="border border-[#333] bg-black relative aspect-square overflow-hidden">
                <video ref={videoRef} playsInline muted className={`w-full h-full object-cover ${cameraOn ? '' : 'hidden'}`} />
                <canvas ref={canvasRef} className="hidden" />
                {!cameraOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                        <button type="button" onClick={startCamera} className="bg-white text-black font-bold uppercase tracking-widest text-sm px-8 py-4 hover:bg-[#ccc]">ACTIVAR CÁMARA</button>
                        {cameraError && <p role="alert" className="font-mono text-xs uppercase tracking-widest text-red-500">{cameraError}</p>}
                    </div>
                )}
            </div>
            {cameraOn && (
                <button type="button" onClick={stopCamera} className="font-mono text-[10px] uppercase tracking-[0.3em] border border-[#333] text-[#888] hover:text-white hover:border-white px-6 py-3 self-center">APAGAR CÁMARA</button>
            )}

            {/* Búsqueda manual */}
            <div className="border-t border-[#333] pt-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <label htmlFor="door-search" className="sr-only">Buscar por nombre o correo</label>
                    <input id="door-search" value={query} onChange={e => setQuery(e.target.value)} minLength={3} required placeholder="Nombre o correo del comprador" className="flex-1 bg-[#111] border border-[#333] text-white p-3 font-mono text-sm" />
                    <button type="submit" disabled={searching} className="border border-white text-white font-mono text-xs uppercase tracking-widest px-4 hover:bg-white hover:text-black disabled:opacity-50">{searching ? '...' : 'BUSCAR'}</button>
                </form>

                <ul className="flex flex-col gap-2 mt-4">
                    {results.map(ticket => (
                        <li key={ticket.code} className="border border-[#222] bg-[#0a0a0a] p-3 flex justify-between items-center gap-4 font-mono text-xs uppercase tracking-widest">
                            <span>
                                <span className="block text-white">{ticket.holderName}</span>
                                <span className="block text-[#888] text-[10px] mt-1 normal-case">{ticket.buyerEmail}</span>
                                <span className="block text-[#888] text-[10px] mt-1">{ticket.tier} · Folio {String(ticket.folio).padStart(4, '0')}</span>
                            </span>
                            {ticket.status === 'VALID' ? (
                                <button type="button" onClick={() => admitFromSearch(ticket.code)} className="bg-[#4ade80] text-black font-bold px-3 py-2 whitespace-nowrap hover:bg-white">INGRESAR</button>
                            ) : (
                                <span className={ticket.status === 'USED' ? 'text-[#888]' : 'text-red-500'}>{ticket.status === 'USED' ? 'YA USADA' : 'ANULADA'}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
