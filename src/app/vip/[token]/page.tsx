import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function VipPage({ params }: { params: { token: string } }) {
  const { token } = params

  // 1. Validar si el token existe
  const invitation = await prisma.invitation.findUnique({
    where: { token }
  })

  if (!invitation) {
    notFound()
  }

  // 2. Obtener el contenido del evento VIP
  let vipContent = await prisma.vipEventContent.findUnique({
    where: { id: 'vip-singleton' }
  })

  // Fallback de seguridad si no han guardado nada en el editor aún
  if (!vipContent) {
    vipContent = {
      id: 'vip-singleton',
      title: 'TALLER ZERO EXCLUSIVO',
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
        <div className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 text-[10px] md:text-xs font-mono tracking-[0.4em] uppercase font-bold z-20 whitespace-nowrap text-center animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          ACCESO CONFIRMADO: {invitation.guestName}
        </div>

        {/* SECCIÓN 1: BIENVENIDA (Grid 50/50: FOTO - TEXTO) */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="aspect-square bg-[#0a0a0a] border-b md:border-r border-[#333] relative flex items-center justify-center overflow-hidden">
            {vipContent.welcomeImage ? (
              <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80 mix-blend-luminosity" style={{ backgroundImage: `url(${vipContent.welcomeImage})` }}></div>
            ) : (
              <div className="absolute inset-0 bg-[#111]"></div>
            )}
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-[#555] tracking-widest uppercase">/// REC 01</div>
          </div>
          
          <div className="p-8 md:p-16 border-b border-[#333] flex flex-col justify-center text-center md:text-left bg-[#050505]">
            <span className="text-[10px] text-[#555] font-mono tracking-[0.3em] uppercase mb-6 inline-block w-full border-b border-[#333] pb-2">TALLER ZERO EXCLUSIVO</span>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-6 leading-none">{vipContent.title}</h1>
            <p className="font-mono text-black bg-white uppercase tracking-[0.2em] text-xs font-bold px-4 py-2 inline-block self-center md:self-start mb-8">
              {vipContent.dateText}
            </p>
            <p className="font-mono text-sm leading-relaxed text-[#ddd] whitespace-pre-line text-justify md:text-left uppercase">
              {vipContent.welcomeText}
            </p>
          </div>
        </div>

        {/* SECCIÓN 2: INFORMACIÓN (Grid 50/50: TEXTOS - FOTO) */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-16 border-b md:border-b-0 md:border-r border-[#333] flex flex-col justify-center order-2 md:order-1 bg-[#020202]">
            <div className="space-y-12">
              <div className="border-l-2 border-[#333] pl-6">
                <h3 className="font-mono text-[10px] tracking-widest text-[#555] mb-4 uppercase">/// LOCACIÓN SECRETA</h3>
                <p className="font-mono text-sm md:text-base leading-relaxed text-white uppercase tracking-wider">{vipContent.location}</p>
              </div>
              
              <div className="border-l-2 border-[#333] pl-6">
                <h3 className="font-mono text-[10px] tracking-widest text-[#555] mb-4 uppercase">/// LINEUP</h3>
                <p className="font-mono text-base md:text-lg leading-relaxed text-[#ddd] whitespace-pre-line uppercase font-bold tracking-tight">{vipContent.lineup}</p>
              </div>
              
              <div className="border-l-2 border-[#333] pl-6">
                <h3 className="font-mono text-[10px] tracking-widest text-[#555] mb-4 uppercase">/// REGLAS DE ACCESO</h3>
                <p className="font-mono text-[10px] md:text-xs leading-relaxed text-[#888] whitespace-pre-line uppercase tracking-widest">{vipContent.rules}</p>
              </div>
            </div>
          </div>

          <div className="aspect-square bg-[#0a0a0a] border-b md:border-b-0 border-[#333] relative flex items-center justify-center overflow-hidden order-1 md:order-2">
            {vipContent.infoImage ? (
              <div className="absolute inset-0 bg-cover bg-center grayscale opacity-80 mix-blend-luminosity" style={{ backgroundImage: `url(${vipContent.infoImage})` }}></div>
            ) : (
              <div className="absolute inset-0 bg-[#111]"></div>
            )}
            <div className="absolute top-4 right-4 font-mono text-[10px] text-[#555] tracking-widest uppercase">/// REC 02</div>
          </div>
        </div>

        {/* SECCIÓN 3: DESPEDIDA (ANCHO COMPLETO) */}
        <div className="p-12 md:p-20 border-t border-[#333] flex flex-col items-center bg-[#050505]">
           <p className="font-mono text-sm md:text-base leading-relaxed text-[#888] whitespace-pre-line max-w-2xl text-center uppercase tracking-widest mb-16">
             {vipContent.farewellText}
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
