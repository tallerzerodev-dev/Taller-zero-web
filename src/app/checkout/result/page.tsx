import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ClearCartOnSuccess from './ClearCartOnSuccess';
import { syncPayment } from '@/lib/payments';

export const dynamic = 'force-dynamic';

type ResultState = 'paid' | 'pending' | 'failed' | 'unknown';

export default async function CheckoutResultPage({ searchParams }: { searchParams: { collection_id?: string; status?: string; external_reference?: string; payment_id?: string } }) {
    const paymentId = searchParams.payment_id || searchParams.collection_id || '';

    // Los parámetros de la URL los puede escribir cualquiera, así que NO deciden nada.
    // Solo se usa el ID de pago para preguntarle a Mercado Pago, y el estado que se muestra
    // es el que quedó guardado en la base de datos.
    let orderId = '';
    if (/^\d{1,20}$/.test(paymentId)) {
        try {
            const result = await syncPayment(paymentId);
            if (result.kind === 'store') orderId = result.orderId || '';
        } catch (error) {
            console.error('Error verificando el pago en la página de resultado', error);
        }
    }

    const order = orderId
        ? await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, status: true } })
        : null;

    let state: ResultState = 'unknown';
    if (order) {
        if (['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status)) state = 'paid';
        else if (order.status === 'PENDING') state = 'pending';
        else state = 'failed';
    } else if (searchParams.status) {
        state = 'failed';
    }

    const orderNumber = order ? order.id.slice(-6).toUpperCase() : '';

    if (state === 'unknown') {
        return (
            <main className="flex-1 flex flex-col items-center justify-center bg-black min-h-screen px-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold uppercase tracking-widest text-red-500 mb-4">Error de Pago</h1>
                    <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-8">No se recibió información de la transacción.</p>
                    <Link href="/store" className="text-xs px-6 py-3 border border-white text-white font-mono uppercase hover:bg-white hover:text-black transition-colors">Volver a la tienda</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 flex items-center justify-center bg-black min-h-screen px-6">
            {state === 'paid' && <ClearCartOnSuccess />}
            <div className="max-w-md w-full border border-[#333] p-8 bg-[#0a0a0a] text-center">
                {state === 'paid' && (
                    <>
                        <h1 className="text-3xl font-bold uppercase tracking-widest text-white mb-2">Pago Exitoso</h1>
                        <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-8">Tu orden #{orderNumber} ha sido confirmada.</p>
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
                )}
                {state === 'pending' && (
                    <>
                        <h1 className="text-3xl font-bold uppercase tracking-widest text-white mb-2">Confirmando Pago</h1>
                        <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-8">
                            Estamos esperando la confirmación de tu pago para la orden #{orderNumber}. Te avisaremos por correo cuando se apruebe.
                        </p>
                    </>
                )}
                {state === 'failed' && (
                    <>
                        <h1 className="text-3xl font-bold uppercase tracking-widest text-red-500 mb-2">Pago No Completado</h1>
                        <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-8">Hubo un problema con tu pago o fue rechazado.</p>
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
