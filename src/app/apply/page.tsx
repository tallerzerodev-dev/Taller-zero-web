import { prisma } from '@/lib/prisma'
import { FadeIn } from '@/components/ui/Animations'
import { ApplyForm } from './components/ApplyForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Postulaciones | Taller Zero',
  description: 'Postula para tocar en Taller Zero.',
}

export const dynamic = 'force-dynamic'

export default async function ApplyPage() {
  const homeData = await prisma.homeContent.findUnique({
    where: { id: 'home-singleton' }
  })

  const isEnabled = homeData?.applicationsEnabled || false

  return (
    <main className="flex-1 flex flex-col bg-black min-h-screen pt-32 pb-32 px-6">
      <div className="w-full max-w-2xl mx-auto">
        <FadeIn>
          <span className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em] font-bold border border-[#333] px-2 py-1 mb-6 self-start inline-block">
            OPEN CALL
          </span>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white mb-6">
            Postulaciones
          </h1>
          
          {!isEnabled ? (
            <div className="bg-[#111] border border-[#333] p-8 text-center mt-12">
              <h2 className="text-xl font-mono uppercase tracking-widest text-white mb-4">Postulaciones Cerradas</h2>
              <p className="text-[#888] font-sans">
                Actualmente no estamos recibiendo material. Mantente atento a nuestras redes para futuras convocatorias.
              </p>
            </div>
          ) : (
            <div className="mt-12">
              <p className="text-[#888] font-mono text-sm uppercase tracking-widest mb-12">
                Completa el formulario a continuación para enviar tu material. Buscamos propuestas de techno crudo, industrial y sonidos experimentales.
              </p>
              <ApplyForm />
            </div>
          )}
        </FadeIn>
      </div>
    </main>
  )
}
