import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { CheckCircle2, XCircle, AlertTriangle, ScanLine } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { isStaffEmail } from '@/lib/admin'
import { findTicketForEntry, TICKET_CODE_PATTERN } from '@/lib/tickets'
import { formatEventDateTime } from '@/lib/dates'
import { confirmEntry, confirmTicketEntry } from './actions'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const TIME_ZONE = 'America/Santiago'

function Panel({ tone, children }: { tone: 'red' | 'green' | 'neutral'; children: React.ReactNode }) {
  const tones = {
    red: 'bg-[#3a0000] border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)]',
    green: 'bg-[#002a0f] border-[#4ade80] shadow-[0_0_50px_rgba(74,222,128,0.2)]',
    neutral: 'bg-[#0a0a0a] border-[#333]',
  }
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className={`border-2 p-8 md:p-16 w-full max-w-lg text-center ${tones[tone]}`}>{children}</div>
    </div>
  )
}

function FakeCode() {
  return (
    <Panel tone="red">
      <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6" />
      <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mb-2">QR FALSO</h1>
      <p className="text-red-300 font-mono text-sm uppercase tracking-widest">Este código no existe en la base de datos.</p>
    </Panel>
  )
}

export default async function ScanPage({ params }: { params: { token: string } }) {
  const { token } = params

  // Abrir este enlace NO marca la entrada. Solo el personal de puerta con sesión iniciada
  // ve los datos del invitado y puede confirmar el ingreso con el botón.
  const session = await getServerSession(authOptions)
  if (!isStaffEmail(session?.user?.email)) {
    return (
      <Panel tone="neutral">
        <ScanLine className="w-24 h-24 text-white mx-auto mb-6" />
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mb-4">PASE DE ENTRADA</h1>
        <p className="text-[#888] font-mono text-sm uppercase tracking-widest mb-8">Presenta este código QR al personal en la entrada del evento.</p>
        <Link href="/login" className="font-mono text-[10px] uppercase tracking-[0.3em] border border-[#333] text-[#555] hover:text-white hover:border-white transition-colors px-6 py-3">
          ACCESO STAFF
        </Link>
      </Panel>
    )
  }

  // ---- Entradas compradas ----
  if (TICKET_CODE_PATTERN.test(token)) {
    const ticket = await findTicketForEntry(token)
    if (!ticket) return <FakeCode />

    const folio = String(ticket.folio).padStart(4, '0')

    if (ticket.status === 'CANCELLED' || ticket.order.status !== 'PAID') {
      return (
        <Panel tone="red">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mb-4">ENTRADA ANULADA</h1>
          <p className="text-red-300 font-mono text-sm uppercase tracking-widest font-bold">NO PERMITIR EL INGRESO.<br /><br />La compra fue reembolsada o el evento se canceló.</p>
        </Panel>
      )
    }

    if (ticket.status === 'USED') {
      return (
        <Panel tone="red">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mb-4">ENTRADA YA USADA</h1>
          <div className="bg-black/50 p-4 mb-6">
            <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-1">COMPRADA POR:</p>
            <p className="text-white font-bold text-xl uppercase">{ticket.holderName}</p>
          </div>
          <p className="text-red-300 font-mono text-sm uppercase tracking-widest font-bold">
            NO PERMITIR UN SEGUNDO INGRESO.<br /><br />
            FECHA DE USO: {ticket.usedAt?.toLocaleString('es-CL', { timeZone: TIME_ZONE })}
            {ticket.usedBy ? <><br />VALIDADA POR: {ticket.usedBy}</> : null}
          </p>
        </Panel>
      )
    }

    return (
      <Panel tone="green">
        <CheckCircle2 className="w-24 h-24 text-[#4ade80] mx-auto mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white mb-4">ENTRADA VÁLIDA</h1>
        <div className="border-t border-[#4ade80]/30 pt-6 mt-6">
          <p className="text-[#4ade80] font-mono text-xs uppercase tracking-widest mb-2">{ticket.event.title}</p>
          <p className="text-[#888] font-mono text-[10px] uppercase tracking-widest mb-6">{formatEventDateTime(ticket.event.startsAt)}</p>
          <p className="text-white font-bold text-3xl md:text-4xl uppercase tracking-tighter">{ticket.ticketType.name}</p>
          <p className="text-white font-mono text-sm uppercase tracking-widest mt-4">{ticket.holderName}</p>
          <p className="text-[#888] font-mono text-xs mt-2">{ticket.order.buyerEmail}</p>
          <span className="mt-4 inline-block text-white font-mono text-[10px] tracking-widest bg-[#222] px-3 py-1 border border-[#333]">FOLIO {folio}</span>
        </div>
        <form action={confirmTicketEntry.bind(null, token)} className="mt-8">
          <button type="submit" className="w-full bg-[#4ade80] text-black font-bold uppercase tracking-widest text-sm px-6 py-5 hover:bg-white transition-colors">
            CONFIRMAR INGRESO
          </button>
        </form>
        <p className="mt-4 text-[#4ade80]/60 font-mono text-[10px] uppercase tracking-widest">
          La entrada se marca como usada solo al confirmar.
        </p>
      </Panel>
    )
  }

  // ---- Invitaciones (VIP / ganadores) ----
  const invitation = await prisma.invitation.findUnique({
    where: { token }
  })

  // Si no existe, alguien inventó un QR o un link
  if (!invitation) return <FakeCode />

  if (invitation.isScanned) {
    return (
      <Panel tone="red">
        <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mb-4">ENTRADA YA USADA</h1>
        <div className="bg-black/50 p-4 mb-6">
          <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-1">PERTENECE A:</p>
          <p className="text-white font-bold text-xl uppercase">{invitation.guestName}</p>
        </div>
        <p className="text-red-300 font-mono text-sm uppercase tracking-widest font-bold">
          NO PERMITIR UN SEGUNDO INGRESO.<br /><br />
          FECHA DE USO: {invitation.scannedAt?.toLocaleString('es-CL', { timeZone: TIME_ZONE })}
        </p>
      </Panel>
    )
  }

  // Invitación válida y sin usar: el staff confirma el ingreso con el botón
  return (
    <Panel tone="green">
      <CheckCircle2 className="w-24 h-24 text-[#4ade80] mx-auto mb-6" />
      <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter text-white mb-4">ACCESO VÁLIDO</h1>
      <div className="border-t border-[#4ade80]/30 pt-6 mt-6">
        <p className="text-[#4ade80] font-mono text-xs uppercase tracking-widest mb-2">IDENTIDAD DEL {invitation.type === 'WINNER' ? 'GANADOR' : 'INVITADO'}:</p>
        <p className="text-white font-bold text-3xl md:text-4xl uppercase tracking-tighter">{invitation.guestName}</p>
        <p className="text-[#888] font-mono text-xs mt-2">{invitation.guestEmail}</p>
        <div className="mt-4 inline-block">
          {invitation.type === 'WINNER' ? (
            <span className="text-yellow-500 font-mono text-[10px] tracking-widest bg-[#1a1000] px-3 py-1 border border-yellow-900">GANADOR DE CONCURSO</span>
          ) : (
            <span className="text-white font-mono text-[10px] tracking-widest bg-[#222] px-3 py-1 border border-[#333]">INVITADO VIP</span>
          )}
        </div>
      </div>
      <form action={confirmEntry.bind(null, token)} className="mt-8">
        <button type="submit" className="w-full bg-[#4ade80] text-black font-bold uppercase tracking-widest text-sm px-6 py-5 hover:bg-white transition-colors">
          CONFIRMAR INGRESO
        </button>
      </form>
      <p className="mt-4 text-[#4ade80]/60 font-mono text-[10px] uppercase tracking-widest">
        La entrada se marca como usada solo al confirmar.
      </p>
    </Panel>
  )
}
