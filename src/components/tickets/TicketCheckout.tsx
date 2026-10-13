'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import { formatCLP } from '@/lib/dates'

interface Line {
    ticketTypeId: string
    name: string
    price: number
    quantity: number
}

interface Props {
    slug: string
    eventTitle: string
    eventSubtitle: string
    lines: Line[]
}

const inputClass = 'w-full bg-[#111] border border-[#333] p-3 focus:border-white focus:outline-none transition-colors text-white font-mono text-sm'
const labelClass = 'font-mono text-xs uppercase tracking-widest text-[#aaa] block mb-1'

function formatRemaining(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`
}

export function TicketCheckout({ slug, eventTitle, eventSubtitle, lines }: Props) {
    const { data: session } = useSession()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [emailConfirm, setEmailConfirm] = useState('')
    const [phone, setPhone] = useState('')
    const [acceptTerms, setAcceptTerms] = useState(false)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [preferenceId, setPreferenceId] = useState<string | null>(null)
    const [expiresAt, setExpiresAt] = useState<number | null>(null)
    const [remaining, setRemaining] = useState(0)

    const total = lines.reduce((acc, l) => acc + l.price * l.quantity, 0)
    const expired = expiresAt !== null && remaining <= 0

    useEffect(() => {
        const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY_TEST || ''
        if (publicKey) initMercadoPago(publicKey, { locale: 'es-CL' })
    }, [])

    // Si hay sesión iniciada se propone ese correo, pero se puede cambiar
    useEffect(() => {
        const sessionEmail = session?.user?.email
        if (sessionEmail) {
            setEmail(prev => prev || sessionEmail)
            setEmailConfirm(prev => prev || sessionEmail)
        }
    }, [session])

    useEffect(() => {
        if (expiresAt === null) return
        const tick = () => setRemaining(expiresAt - Date.now())
        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [expiresAt])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
            setError('Los correos no coinciden. A ese correo llegarán tus entradas.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/tickets/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventSlug: slug,
                    items: lines.map(l => ({ ticketTypeId: l.ticketTypeId, quantity: l.quantity })),
                    firstName,
                    lastName,
                    email,
                    phone,
                    acceptTerms,
                }),
            })
            const result = await res.json().catch(() => ({}))
            if (!res.ok || !result.preferenceId) {
                throw new Error(result.error || 'No se pudo generar el pago.')
            }
            setPreferenceId(result.preferenceId)
            setExpiresAt(new Date(result.expiresAt).getTime())
        } catch (err: any) {
            setError(err.message || 'Error inesperado')
        } finally {
            setLoading(false)
        }
    }

    const step = preferenceId ? 2 : 1

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="border-b border-[#333] mb-8 pb-6">
                <Link href={`/eventos/${slug}`} className="font-mono text-xs uppercase tracking-widest text-[#888] hover:text-white transition-colors">← Volver al evento</Link>
                <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter text-white mt-4 leading-none">{eventTitle}</h1>
                <p className="font-mono text-xs uppercase tracking-widest text-[#888] mt-3">{eventSubtitle}</p>
            </div>

            {/* Pasos */}
            <ol className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest mb-10">
                <li className={`px-3 py-1 border ${step === 1 ? 'bg-white text-black border-white font-bold' : 'border-[#333] text-[#888]'}`}>01 Datos</li>
                <li className="w-10 h-[1px] bg-[#333]" aria-hidden="true" />
                <li className={`px-3 py-1 border ${step === 2 ? 'bg-white text-black border-white font-bold' : 'border-[#333] text-[#888]'}`}>02 Pago</li>
            </ol>

            <div className="flex flex-col md:flex-row gap-10 md:gap-16">
                <div className="w-full md:w-2/3">
                    {step === 1 ? (
                        <form id="ticket-checkout-form" onSubmit={handleSubmit} className="space-y-5 bg-[#0a0a0a] p-4 md:p-6 border border-[#222]">
                            <h2 className="text-lg font-bold uppercase tracking-widest text-white">Registra tus datos</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="tk-nombre" className={labelClass}>Nombre</label>
                                    <input id="tk-nombre" required minLength={2} maxLength={60} autoComplete="given-name" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label htmlFor="tk-apellido" className={labelClass}>Apellido</label>
                                    <input id="tk-apellido" required minLength={2} maxLength={60} autoComplete="family-name" value={lastName} onChange={e => setLastName(e.target.value)} className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="tk-email" className={labelClass}>Correo electrónico</label>
                                <input id="tk-email" required type="email" maxLength={200} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                            </div>

                            <div>
                                <label htmlFor="tk-email2" className={labelClass}>Confirmar correo electrónico</label>
                                <input id="tk-email2" required type="email" maxLength={200} autoComplete="email" value={emailConfirm} onChange={e => setEmailConfirm(e.target.value)} className={inputClass} />
                                <p className="font-mono text-[10px] uppercase tracking-widest text-[#555] mt-2">A este correo llegarán tus entradas con el código QR.</p>
                            </div>

                            <div>
                                <label htmlFor="tk-telefono" className={labelClass}>Teléfono celular</label>
                                <input id="tk-telefono" required type="tel" minLength={6} maxLength={30} autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+56 9 ..." />
                            </div>

                            <label className="flex items-start gap-3 font-mono text-xs uppercase tracking-widest text-[#aaa] cursor-pointer">
                                <input type="checkbox" required checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="mt-0.5" />
                                <span>
                                    Acepto los <Link href="/terms" target="_blank" className="underline text-white">términos de uso</Link> y la <Link href="/privacy" target="_blank" className="underline text-white">política de privacidad</Link>
                                </span>
                            </label>

                            {error && <p role="alert" className="text-red-500 font-mono font-bold text-xs uppercase tracking-widest">{error}</p>}
                        </form>
                    ) : (
                        <div className="bg-[#0a0a0a] p-4 md:p-6 border border-[#222]">
                            <h2 className="text-lg font-bold uppercase tracking-widest text-white mb-4">Pago</h2>
                            {expired ? (
                                <div>
                                    <p className="font-mono text-sm uppercase tracking-widest text-red-500 font-bold mb-2">TU RESERVA VENCIÓ</p>
                                    <p className="font-mono text-xs uppercase tracking-widest text-[#888] mb-6">Las entradas volvieron a quedar disponibles. Si ya pagaste, revisa tu correo.</p>
                                    <Link href={`/eventos/${slug}`} className="brutalist-button inline-block">VOLVER AL EVENTO</Link>
                                </div>
                            ) : (
                                <>
                                    <p className="font-mono text-xs uppercase tracking-widest text-[#888] mb-2">Tus entradas están reservadas por</p>
                                    <p className="font-mono text-4xl text-white font-bold mb-6" aria-live="off">{formatRemaining(remaining)}</p>
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#555] mb-6">El pago se hace en Mercado Pago, solo con tarjeta de crédito, débito o prepago.</p>
                                    <Wallet
                                        initialization={{ preferenceId: preferenceId!, redirectMode: 'self' }}
                                        customization={{ texts: { action: 'pay', valueProp: 'security_safety' } } as any}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Resumen */}
                <div className="w-full md:w-1/3">
                    <div className="bg-[#050505] border border-[#333] p-6 font-mono uppercase tracking-widest md:sticky md:top-28">
                        <h2 className="text-lg font-bold mb-6 border-b border-[#222] pb-4 text-white">Resumen</h2>
                        <ul className="space-y-3 mb-6 text-xs text-[#aaa] border-b border-[#222] pb-6">
                            {lines.map(line => (
                                <li key={line.ticketTypeId} className="flex justify-between gap-4">
                                    <span>{line.quantity} × {line.name}</span>
                                    <span className="text-white whitespace-nowrap">{formatCLP(line.price * line.quantity)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="flex justify-between items-end mb-8">
                            <span className="text-base text-white">Total</span>
                            <span className="text-xl font-bold text-white">{formatCLP(total)} <span className="text-[10px] text-[#888]">CLP</span></span>
                        </div>
                        {step === 1 && (
                            <button form="ticket-checkout-form" type="submit" disabled={loading} className="w-full py-4 bg-white text-black font-bold text-sm uppercase tracking-widest hover:bg-[#ccc] transition-colors disabled:opacity-50">
                                {loading ? <span className="animate-pulse">RESERVANDO...</span> : 'SIGUIENTE →'}
                            </button>
                        )}
                        <p className="text-[10px] text-[#555] mt-4 leading-relaxed">Sin cargo por servicio. Precio final con impuestos incluidos.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
