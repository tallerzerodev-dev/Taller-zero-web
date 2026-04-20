import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function ScanPage({ params }: { params: { token: string } }) {
  const { token } = params

  // 1. Buscar la invitación
  const invitation = await prisma.invitation.findUnique({
    where: { token }
  })

  // Si no existe, alguien inventó un QR o un link
  if (!invitation) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-[#3a0000] border-2 border-red-600 p-8 md:p-16 w-full max-w-lg text-center shadow-[0_0_50px_rgba(220,38,38,0.3)]">
          <AlertTriangle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mb-2">QR FALSO</h1>
          <p className="text-red-300 font-mono text-sm uppercase tracking-widest">Esta invitación no existe en la base de datos.</p>
        </div>
      </div>
    )
  }

  // 2. Comprobar si ya fue escaneada
  if (invitation.isScanned) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <div className="bg-[#3a0000] border-2 border-red-600 p-8 md:p-16 w-full max-w-lg text-center shadow-[0_0_50px_rgba(220,38,38,0.3)]">
          <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white mb-4">ACCESO DENEGADO</h1>
          <div className="bg-black/50 p-4 mb-6">
             <p className="text-[#888] font-mono text-xs uppercase tracking-widest mb-1">PERTENECE A:</p>
             <p className="text-white font-bold text-xl uppercase">{invitation.guestName}</p>
          </div>
          <p className="text-red-300 font-mono text-sm uppercase tracking-widest font-bold">
            ESTA ENTRADA YA FUE USADA.<br/><br/>
            FECHA DE USO: {invitation.scannedAt?.toLocaleString('es-CL')}
          </p>
        </div>
      </div>
    )
  }

  // 3. Si no ha sido escaneada, la marcamos como válida y actualizada
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      isScanned: true,
      scannedAt: new Date()
    }
  })

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-[#002a0f] border-2 border-[#4ade80] p-8 md:p-16 w-full max-w-lg text-center shadow-[0_0_50px_rgba(74,222,128,0.2)]">
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
        <p className="mt-8 text-[#4ade80]/60 font-mono text-[10px] uppercase tracking-widest">
          La base de datos ha marcado esta entrada como usada.
        </p>
      </div>
    </div>
  )
}
