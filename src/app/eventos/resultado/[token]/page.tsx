import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { syncPayment } from '@/lib/payments'
import { syncTicketOrderByReference } from '@/lib/tickets'
import { AutoRefresh } from './AutoRefresh'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Resultado de tu compra',
  robots: { index: false, follow: false },
}

export default async function TicketResultPage({ params, searchParams }: { params: { token: string }; searchParams: { payment_id?: string; collection_id?: string } }) {
  if (!/^[a-f0-9]{32}$/.test(params.token)) notFound()

  // Los parámetros de la URL no deciden nada: el ID de pago solo se usa para preguntarle a
  // Mercado Pago, y lo que se muestra es el estado guardado en la base.
  const paymentId = searchParams.payment_id || searchParams.collection_id || ''
  const current = await prisma.ticketOrder.findUnique({
    where: { accessToken: params.token },
    select: { id: true, status: true },
  })
  if (!current) notFound()

  // Solo se consulta a Mercado Pago mientras la orden no esté resuelta. Si la URL trae un ID de pago se
  // usa ese; si no (o si el aviso nunca llegó) se buscan los pagos de la orden por su referencia.
  if (current.status === 'PENDING' || current.status === 'EXPIRED') {
    try {
      if (/^\d{1,20}$/.test(paymentId)) await syncPayment(paymentId)
      else await syncTicketOrderByReference(current.id)
    } catch (error) {
      console.error('Error verificando el pago de entradas en la página de resultado', error)
    }
  }

  const order = await prisma.ticketOrder.findUnique({
    where: { accessToken: params.token },
    select: { id: true, status: true, expiresAt: true, event: { select: { slug: true, title: true } }, _count: { select: { tickets: true } } },
  })
  if (!order) notFound()

  if (order.status === 'PAID' && order._count.tickets > 0) {
    redirect(`/entradas/${params.token}`)
  }

  const orderNumber = order.id.slice(-6).toUpperCase()
  const stillPayable = order.status === 'PENDING' && order.expiresAt > new Date()
  // Vino desde Mercado Pago con un pago, pero todavía no está aprobado en la base
  const confirming = stillPayable && paymentId !== ''

  let title = 'Pago No Completado'
  let detail = 'No se registró un pago para esta compra. Las entradas volvieron a quedar disponibles.'
  if (order.status === 'PAID') {
    title = 'Pago Recibido'
    detail = 'Recibimos tu pago, pero no pudimos emitir tus entradas automáticamente. Te contactaremos por correo a la brevedad.'
  } else if (order.status === 'REFUNDED') {
    title = 'Compra Reembolsada'
    detail = 'Esta compra fue reembolsada y sus entradas ya no son válidas.'
  } else if (confirming) {
    title = 'Confirmando Pago'
    detail = 'Estamos esperando la confirmación de Mercado Pago. Esta página se actualiza sola; no la cierres.'
  } else if (stillPayable) {
    detail = 'El pago no se completó. Tu reserva sigue activa por unos minutos: puedes volver a intentarlo desde el evento.'
  }

  return (
    <main className="flex-1 flex items-center justify-center bg-black min-h-screen px-6">
      {confirming && <AutoRefresh />}
      <div className="max-w-md w-full border border-[#333] p-8 bg-[#0a0a0a] text-center">
        <p className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em] mb-4">ORDEN #{orderNumber} {'///'} {order.event.title}</p>
        <h1 className={`text-3xl font-bold uppercase tracking-widest mb-4 ${confirming || order.status === 'PAID' ? 'text-white' : 'text-red-500'} ${confirming ? 'animate-pulse' : ''}`}>{title}</h1>
        <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-8 leading-relaxed">{detail}</p>
        <Link href={`/eventos/${order.event.slug}`} className="block w-full text-xs px-6 py-4 border border-white text-white font-mono uppercase hover:bg-white hover:text-black transition-colors">
          VOLVER AL EVENTO
        </Link>
      </div>
    </main>
  )
}
