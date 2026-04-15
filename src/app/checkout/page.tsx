"use client";

import Link from 'next/link';
import { FadeIn } from '@/components/ui/Animations';
import { useRef, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';

export default function CheckoutPage() {
    const formRef = useRef<HTMLFormElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [envioTipo, setEnvioTipo] = useState<'region' | 'rm' | 'retiro'>('region');
    const [modoCompra, setModoCompra] = useState<'guest' | 'login'>('guest');
    const cartItems = useCartStore(state => state.items);
    const clearCart = useCartStore(state => state.clearCart);

    // Calcular totales reales desde el carrito
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Lógica de envío
    let envio = 0;
    let envioLabel = '';
    if (envioTipo === 'region') {
        envio = 0;
        envioLabel = 'Por pagar en destino (Starken)';
    } else if (envioTipo === 'rm') {
        envio = 5000;
        envioLabel = 'BlueExpress (tarifa fija $5.000)';
    } else if (envioTipo === 'retiro') {
        envio = 0;
        envioLabel = 'Retiro en Taller (gratis)';
    }
    const total = subtotal + envio;

    const handleFlowPay = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const form = formRef.current;
        if (!form) return;
        const data = new FormData(form);
        const nombre = data.get('nombre')?.toString() || '';
        const apellido = data.get('apellido')?.toString() || '';
        const email = data.get('email')?.toString() || '';
        const telefono = data.get('telefono')?.toString() || '';
        const direccion = data.get('direccion')?.toString() || '';
        const comuna = data.get('comuna')?.toString() || '';
        const region = data.get('region')?.toString() || '';
        const shippingAddress = `${direccion}, ${comuna}, ${region}`;
        try {
            const res = await fetch('/api/flow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: total,
                    currency: 'CLP',
                    concept: `Compra de ${nombre} ${apellido}`,
                    email,
                    orderId: `${Date.now()}`,
                    customerName: `${nombre} ${apellido}`.trim(),
                    customerPhone: telefono,
                    shippingAddress,
                    items: cartItems.map(item => ({
                        id: item.id,
                        title: item.title,
                        price: item.price,
                        quantity: item.quantity,
                        size: item.size || undefined,
                    })),
                })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Error en el pago');
            clearCart();
            if (result.url) {
                window.location.href = result.url;
            } else {
                setError('No se recibió URL de pago de Flow');
            }
        } catch (err: any) {
            setError(err.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex-1 flex justify-center bg-black min-h-screen px-2 py-10 md:px-6 md:py-24">
            <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16">
                {/* FORMULARIO Y OPCIONES */}
                <FadeIn className="w-full md:w-2/3 flex flex-col">
                    <div className="border-b border-[#222] mb-8 pb-4 flex items-center justify-between">
                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Checkout</h1>
                        <Link href="/cart" className="font-mono text-xs uppercase tracking-widest text-[#888] hover:text-white transition-colors">← Carro</Link>
                    </div>

                    {/* Modo de compra */}
                    <div className="flex gap-2 mb-6">
                        <button
                            type="button"
                            className={`px-3 py-1 rounded border text-xs font-medium uppercase tracking-widest transition-colors ${modoCompra === 'guest' ? 'bg-[#222] text-white border-[#333]' : 'bg-transparent text-[#888] border-[#222] hover:text-white'}`}
                            onClick={() => setModoCompra('guest')}
                        >
                            Invitado
                        </button>
                        <button
                            type="button"
                            className={`px-3 py-1 rounded border text-xs font-medium uppercase tracking-widest transition-colors ${modoCompra === 'login' ? 'bg-[#222] text-white border-[#333]' : 'bg-transparent text-[#888] border-[#222] hover:text-white'}`}
                            onClick={() => setModoCompra('login')}
                        >
                            Cuenta
                        </button>
                    </div>
                    {modoCompra === 'login' && (
                        <div className="mb-6 text-xs text-[#888]">
                            ¿Ya tienes cuenta? <Link href="/login" className="underline">Inicia sesión</Link>. ¿Nuevo? <Link href="/register" className="underline">Regístrate aquí</Link>.
                        </div>
                    )}

                    <form ref={formRef} onSubmit={handleFlowPay} className="space-y-5 font-mono text-xs tracking-widest bg-[#111] p-4 rounded border border-[#222]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[#aaa]">Nombre</label>
                                <input name="nombre" type="text" className="bg-[#181818] border border-[#222] p-3 rounded focus:border-white focus:outline-none transition-colors text-white" required />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[#aaa]">Apellido</label>
                                <input name="apellido" type="text" className="bg-[#181818] border border-[#222] p-3 rounded focus:border-white focus:outline-none transition-colors text-white" required />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[#aaa]">Email</label>
                            <input name="email" type="email" className="bg-[#181818] border border-[#222] p-3 rounded focus:border-white focus:outline-none transition-colors text-white" required />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[#aaa]">Dirección Completa</label>
                            <input name="direccion" type="text" className="bg-[#181818] border border-[#222] p-3 rounded focus:border-white focus:outline-none transition-colors text-white" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[#aaa]">Comuna</label>
                                <input name="comuna" type="text" className="bg-[#181818] border border-[#222] p-3 rounded focus:border-white focus:outline-none transition-colors text-white" required />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[#aaa]">Región</label>
                                <input name="region" type="text" className="bg-[#181818] border border-[#222] p-3 rounded focus:border-white focus:outline-none transition-colors text-white" required />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[#aaa]">Teléfono</label>
                            <input name="telefono" type="tel" className="bg-[#181818] border border-[#222] p-3 rounded focus:border-white focus:outline-none transition-colors text-white" required />
                        </div>

                        {/* Selector de tipo de envío */}
                        <div className="flex flex-col gap-1 mt-2">
                            <label className="text-[#aaa]">Tipo de Envío</label>
                            <div className="flex flex-col md:flex-row gap-2">
                                <button type="button" className={`flex-1 px-2 py-2 rounded border text-xs font-medium uppercase tracking-widest transition-colors ${envioTipo === 'region' ? 'bg-[#222] text-white border-[#333]' : 'bg-transparent text-[#888] border-[#222] hover:text-white'}`} onClick={() => setEnvioTipo('region')}>
                                    Región (Starken)
                                </button>
                                <button type="button" className={`flex-1 px-2 py-2 rounded border text-xs font-medium uppercase tracking-widest transition-colors ${envioTipo === 'rm' ? 'bg-[#222] text-white border-[#333]' : 'bg-transparent text-[#888] border-[#222] hover:text-white'}`} onClick={() => setEnvioTipo('rm')}>
                                    RM (BlueExpress)
                                </button>
                                <button type="button" className={`flex-1 px-2 py-2 rounded border text-xs font-medium uppercase tracking-widest transition-colors ${envioTipo === 'retiro' ? 'bg-[#222] text-white border-[#333]' : 'bg-transparent text-[#888] border-[#222] hover:text-white'}`} onClick={() => setEnvioTipo('retiro')}>
                                    Retiro Taller
                                </button>
                            </div>
                            <div className="text-xs text-[#888] mt-1">
                                {envioTipo === 'region' && 'Envíos a regiones por Starken, por pagar en destino.'}
                                {envioTipo === 'rm' && 'Envíos en RM por BlueExpress, tarifa fija $5.000.'}
                                {envioTipo === 'retiro' && 'Retiro en taller sin costo.'}
                            </div>
                        </div>

                        {error && <div className="text-red-500 font-bold text-xs mt-2">{error}</div>}
                    </form>
                </FadeIn>

                {/* RESUMEN FINAL */}
                <FadeIn delay={0.2} className="w-full md:w-1/3">
                    <div className="bg-[#101010] border border-[#222] p-8 h-fit font-mono uppercase tracking-widest sticky top-32 rounded shadow">
                        <h2 className="text-lg font-semibold mb-6 border-b border-[#222] pb-4 text-white">Pago</h2>

                        <div className="space-y-3 mb-6 text-xs text-[#aaa] border-b border-[#222] pb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-white">${subtotal.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex items-start justify-between">
                                <span className="pt-1">Envío</span>
                                <span className="text-white ml-2 text-right break-words max-w-[60%]">{envio === 0 ? envioLabel : `$${envio.toLocaleString('es-CL')}`}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-8">
                            <span className="text-base">Total</span>
                            <span className="text-xl font-bold text-white">${total.toLocaleString('es-CL')}</span>
                        </div>

                        <form ref={formRef} onSubmit={handleFlowPay}>
                            <button
                                type="submit"
                                className="w-full py-4 rounded bg-[#181818] text-white font-semibold text-base uppercase tracking-widest border border-[#333] hover:bg-[#222] transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                PAGAR CON FLOW
                                {loading && <span className="text-xs ml-2 animate-pulse">Procesando...</span>}
                            </button>
                        </form>
                    </div>
                </FadeIn>
            </div>
        </main>
    );
}

