import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function WinnerPage({ params }: { params: { token: string } }) {
  const { token } = params

  // 1. Validar si el token existe
  const invitation = await prisma.invitation.findUnique({
    where: { token }
  })

  // Validar también que sea del tipo correcto
  if (!invitation || invitation.type !== 'WINNER') {
    notFound()
  }

  // 2. Obtener el contenido del evento para Ganadores
  let winnerContent = await prisma.winnerEventContent.findUnique({
    where: { id: 'winner-singleton' }
  })

  // Fallback de seguridad si no han guardado nada en el editor aún
  if (!winnerContent) {
    winnerContent = {
      id: 'winner-singleton',
      title: 'TALLER ZERO - GANADOR',
      dateText: 'FECHA POR CONFIRMAR',
      location: 'SECRET LOCATION',
      rules: 'DRESSCODE: INDUSTRIAL BLACK.\nNO FOTOS. NO VIDEOS EN LA PISTA.',
      lineup: 'TBA',
      welcomeImage: null,
      welcomeText: null,
      infoImage: null,
      farewellText: null,
      updatedAt: new Date()
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black flex flex-col justify-center py-10 md:py-20 px-4">
      
      <div className="w-full max-w-[1000px] mx-auto bg-black border border-[#333] shadow-2xl relative">
        
        {/* Etiqueta Flotante Confirmación */}
        <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-2 text-[10px] md:text-xs font-mono tracking-[0.4em] uppercase font-bold z-20 whitespace-nowrap text-center animate-pulse shadow-[0_0_20px_rgba(234,179,8,0.3)]">
          ACCESO GANADOR: {invitation.guestName}
        </div>

        {/* SECCIÓN 1: BIENVENIDA (Grid 50/50: FOTO - TEXTO) */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-square bg-[#1a1000] border-b md:border-r border-[#333] relative flex items-center justify-center overflow-hidden">
            {winnerContent.welcomeImage ? (
              <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80 mix-blend-luminosity" style={{ backgroundImage: `url(${winnerContent.welcomeImage})` }}></div>
            ) : (
              <div className="absolute inset-0 bg-[#111]"></div>
            )}
          </div>
          
          <div className="p-8 md:p-16 border-b border-[#333] flex flex-col justify-center text-center md:text-left bg-[#050505]">
            <span className="text-[10px] text-[#555] font-mono tracking-[0.3em] uppercase mb-6 inline-block w-full border-b border-[#333] pb-2">GANADOR DE CONCURSO TALLER ZERO</span>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-6 leading-none text-yellow-500">{winnerContent.title}</h1>
            <p className="font-mono text-black bg-yellow-500 uppercase tracking-[0.2em] text-xs font-bold px-4 py-2 inline-block self-center md:self-start mb-8">
              {winnerContent.dateText}
            </p>
            <p className="font-mono text-sm leading-relaxed text-[#ddd] whitespace-pre-line text-justify md:text-left uppercase">
              {winnerContent.welcomeText}
            </p>
          </div>
        </div>

        {/* SECCIÓN 2: INFORMACIÓN (Grid 50/50: TEXTOS - FOTO) */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-16 border-b md:border-b-0 md:border-r border-[#333] flex flex-col justify-center order-2 md:order-1 bg-[#020202]">
            <div className="space-y-12">
              <div className="border-l-2 border-yellow-900 pl-6">
                <h3 className="font-mono text-[10px] tracking-widest text-[#555] mb-4 uppercase">{"/// LOCACIÓN SECRETA"}</h3>
                <p className="font-mono text-sm md:text-base leading-relaxed text-white uppercase tracking-wider">{winnerContent.location}</p>
              </div>
              
              <div className="border-l-2 border-yellow-900 pl-6">
                <h3 className="font-mono text-[10px] tracking-widest text-[#555] mb-4 uppercase">{"/// LINEUP"}</h3>
                <p className="font-mono text-base md:text-lg leading-relaxed text-[#ddd] whitespace-pre-line uppercase font-bold tracking-tight">{winnerContent.lineup}</p>
              </div>
              
              <div className="border-l-2 border-yellow-900 pl-6">
                <h3 className="font-mono text-[10px] tracking-widest text-[#555] mb-4 uppercase">{"/// REGLAS DE ACCESO"}</h3>
                <p className="font-mono text-[10px] md:text-xs leading-relaxed text-[#888] whitespace-pre-line uppercase tracking-widest">{winnerContent.rules}</p>
              </div>
            </div>
          </div>

          <div className="aspect-square bg-[#1a1000] border-b md:border-b-0 border-[#333] relative flex items-center justify-center overflow-hidden order-1 md:order-2">
            {winnerContent.infoImage ? (
              <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80 mix-blend-luminosity" style={{ backgroundImage: `url(${winnerContent.infoImage})` }}></div>
            ) : (
              <div className="absolute inset-0 bg-[#111]"></div>
            )}
          </div>
        </div>

        {/* SECCIÓN 3: DESPEDIDA (ANCHO COMPLETO) */}
        <div className="p-12 md:p-20 border-t border-[#333] flex flex-col items-center bg-[#050505]">
           <p className="font-mono text-sm md:text-base leading-relaxed text-[#888] whitespace-pre-line max-w-2xl text-center uppercase tracking-widest mb-16">
             {winnerContent.farewellText}
           </p>

           <div className="flex flex-col items-center border-t border-[#222] w-full pt-12">
             <p className="font-mono text-[10px] text-[#555] text-center max-w-md uppercase tracking-widest mb-8">
               ESTA ES UNA PÁGINA PRIVADA E INTRANSFERIBLE. TU CÓDIGO QR DE ACCESO ÚNICO SE ENCUENTRA EN TU CORREO. NO COMPARTAS ESTE ENLACE O TU ENTRADA SERÁ ANULADA.
             </p>
             <Link href="/" className="font-mono text-[10px] uppercase tracking-[0.3em] border border-[#333] text-[#888] hover:bg-white hover:text-black hover:border-white transition-colors px-6 py-3">
               VOLVER A LA MATRIX
             </Link>
           </div>
        </div>

      </div>
    </div>
  )
}
