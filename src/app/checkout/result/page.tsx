import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import ClearCartOnSuccess from './ClearCartOnSuccess';

export default async function CheckoutResultPage({ searchParams }: { searchParams: { collection_id?: string; status?: string; external_reference?: string; payment_id?: string } }) {
    const { status, external_reference, collection_id, payment_id } = searchParams;
    const isSuccess = status === 'approved';
    const orderId = external_reference || '';

    // Si tenemos orderId y status, podemos actualizar la base de datos (idealmente esto se hace vía Webhook para ser 100% seguro)
    if (orderId && isSuccess) {
        try {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAID' }
            });
        } catch (error) {
            console.error('Error updating order status in Result Page', error);
        }
    }

    if (!status) {
        return (
            <main className="flex-1 flex flex-col items-center justify-center bg-black min-h-screen px-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold uppercase tracking-widest text-red-500 mb-4">Error de Pago</h1>
                    <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-4">No se recibió información de la transacción.</p>
                    <p className="text-[#555] font-mono text-[10px] break-all max-w-lg mx-auto mb-8 bg-[#111] p-2">Debug Data: {JSON.stringify(searchParams)}</p>
                    <Link href="/store" className="text-xs px-6 py-3 border border-white text-white font-mono uppercase hover:bg-white hover:text-black transition-colors">Volver a la tienda</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 flex items-center justify-center bg-black min-h-screen px-6">
            {isSuccess && <ClearCartOnSuccess />}
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
