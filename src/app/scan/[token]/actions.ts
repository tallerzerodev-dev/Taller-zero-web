'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { isStaffEmail } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function confirmEntry(token: string) {
  const session = await getServerSession(authOptions)
  if (!isStaffEmail(session?.user?.email)) {
    throw new Error('No autorizado')
  }

  // Atómico: si dos personas confirman a la vez, solo una encuentra la entrada sin usar
  await prisma.invitation.updateMany({
    where: { token, isScanned: false },
    data: { isScanned: true, scannedAt: new Date() }
  })

  revalidatePath(`/scan/${token}`)
}
