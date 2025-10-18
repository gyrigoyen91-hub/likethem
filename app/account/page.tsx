import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import AccountClient from './AccountClient'

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email && !session?.user?.id) {
    return redirect(`/auth/signin?callbackUrl=${encodeURIComponent("/account")}`)
  }

  const email = session.user.email ?? null
  const sid = (session.user as any)?.id ?? null

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : undefined,
        sid ? { id: sid } : undefined,
      ].filter(Boolean) as any[],
    },
    select: { 
      id: true, 
      fullName: true, 
      avatar: true, 
      email: true, 
      phone: true, 
      provider: true, 
      emailVerified: true,
      role: true
    },
  })

  if (!user) {
    console.warn("[account] user not found for session", { email, sid })
    return redirect(`/auth/signin?callbackUrl=${encodeURIComponent("/account")}`)
  }

  return <AccountClient user={user} session={session} />
} 