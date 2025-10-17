import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { PrismaClient } from '@prisma/client'
import { redirect } from 'next/navigation'
import AccountClient from './AccountClient'

const prisma = new PrismaClient()

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      id: true, 
      email: true, 
      fullName: true, 
      avatar: true, 
      provider: true,
      emailVerified: true,
      phone: true,
      role: true
    }
  })

  if (!dbUser) {
    redirect('/auth/signin')
  }

  return <AccountClient user={dbUser} session={session} />
}