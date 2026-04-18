import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import Link from 'next/link';

function signParams(params: Record<string, any>, secretKey: string) {
    const keys = Object.keys(params).sort();
    let toSign = '';
    for (const key of keys) {
        toSign += key + params[key];
    }
    return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
}

export default async function CheckoutResultPage({ searchParams }: { searchParams: { token?: string } }) {
    const token = searchParams.token;

    if (!token) {
        return (
            <main className="flex-1 flex items-center justify-center bg-black min-h-screen px-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold uppercase tracking-widest text-red-500 mb-4">Error de Pago</h1>
                    <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-8">No se recibió el token de la transacción.</p>
                    <Link href="/store" className="text-xs px-6 py-3 border border-white text-white font-mono uppercase hover:bg-white hover:text-black transition-colors">Volver a la tienda</Link>
                </div>
            </main>
        );
    }

    const apiKey = process.env.FLOW_API_KEY || '';
    const secretKey = process.env.FLOW_SECRET_KEY || '';

    let status = 'PENDING';
    let orderId = '';
    let isSuccess = false;

    if (apiKey && secretKey) {
        try {
            const params = { apiKey, token };
            const s = signParams(params, secretKey);
            const payload = { ...params, s };

            const flowRes = await fetch(`https://sandbox.flow.cl/api/payment/getStatus?${new URLSearchParams(payload as any).toString()}`, {
                method: 'GET',
                // Avoid caching the API response in Next.js
                cache: 'no-store'
            });

            const flowData = await flowRes.json();
            
            if (flowRes.ok) {
                orderId = flowData.commerceOrder;
                // status = 2 is PAID in Flow
                if (flowData.status === 2) {
                    isSuccess = true;
                    status = 'PAID';
                } else if (flowData.status === 3 || flowData.status === 4) {
                    status = 'CANCELLED';
                }
            }
        } catch (error) {
            console.error('Error fetching Flow status', error);
        }
    }

    return (
        <main className="flex-1 flex items-center justify-center bg-black min-h-screen px-6">
            <div className="max-w-md w-full border border-[#333] p-8 bg-[#0a0a0a] text-center">
                {isSuccess ? (
                    <>
                        <h1 className="text-3xl font-bold uppercase tracking-widest text-white mb-2">Pago Exitoso</h1>
                        <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-8">Tu orden #{orderId} ha sido confirmada.</p>
                        <div className="mb-8">
                            <span className="inline-block p-4 bg-[#111] border border-[#222]">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-[#555] font-mono text-[10px] uppercase tracking-widest mb-8">
                            Recibirás un correo con los detalles del envío.
                        </p>
                    </>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold uppercase tracking-widest text-red-500 mb-2">Pago No Completado</h1>
                        <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-8">Hubo un problema con tu pago o fue cancelado.</p>
                        <div className="mb-8">
                            <span className="inline-block p-4 bg-[#111] border border-red-900/30">
                                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </span>
                        </div>
                    </>
                )}
                
                <Link href="/store" className="block w-full text-xs px-6 py-4 border border-white text-white font-mono uppercase hover:bg-white hover:text-black transition-colors">
                    VOLVER A LA TIENDA
                </Link>
            </div>
        </main>
    );
}
