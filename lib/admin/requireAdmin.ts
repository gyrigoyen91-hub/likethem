import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Server-only function to require admin access.
 * Throws/redirects if user is not authenticated or not an admin.
 * 
 * @returns { session, userId } if admin access is granted
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/unauthorized')
  }

  // Get user role from database (not just session, to ensure freshness)
  const { prisma } = await import('@/lib/prisma')
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || user.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  return {
    session,
    userId: session.user.id,
  }
}
