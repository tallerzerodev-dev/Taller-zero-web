import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isStaffEmail } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { formatEventDate } from '@/lib/dates'
import { DoorScanner } from './DoorScanner'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Puerta',
  robots: { index: false, follow: false },
}

// Se listan los eventos desde un día antes: una fiesta que empezó anoche sigue validando de madrugada
const RECENT_MS = 24 * 60 * 60 * 1000

export default async function PuertaPage() {
  // Esta ruta queda fuera de /admin/dashboard a propósito: el personal de puerta no es admin
  const session = await getServerSession(authOptions)
  if (!isStaffEmail(session?.user?.email)) redirect('/login')

  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED', startsAt: { gte: new Date(Date.now() - RECENT_MS) } },
    orderBy: { startsAt: 'asc' },
    select: { id: true, title: true, startsAt: true },
  })

  return (
    <main className="flex-1 flex flex-col bg-black min-h-screen px-4 py-10">
      <div className="w-full max-w-md mx-auto">
        <div className="border-b border-[#333] pb-6 mb-6">
          <p className="font-mono text-[10px] text-[#555] uppercase tracking-[0.3em] mb-2">CONTROL DE ACCESO</p>
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">Puerta</h1>
        </div>
        <DoorScanner events={events.map(e => ({ id: e.id, title: e.title, dateLabel: formatEventDate(e.startsAt) }))} />
      </div>
    </main>
  )
}
