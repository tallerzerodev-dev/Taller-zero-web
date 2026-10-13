'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { isStaffEmail } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { admitTicket } from '@/lib/tickets'

async function requireStaffEmail(): Promise<string> {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email || !isStaffEmail(email)) {
    throw new Error('No autorizado')
  }
  return email
}

export async function confirmEntry(token: string) {
  await requireStaffEmail()

  // Atómico: si dos personas confirman a la vez, solo una encuentra la entrada sin usar
  await prisma.invitation.updateMany({
    where: { token, isScanned: false },
    data: { isScanned: true, scannedAt: new Date() }
  })

  revalidatePath(`/scan/${token}`)
}

export async function confirmTicketEntry(code: string) {
  const staffEmail = await requireStaffEmail()
  await admitTicket(code, staffEmail)
  revalidatePath(`/scan/${code}`)
}
