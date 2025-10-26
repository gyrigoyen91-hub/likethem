import { getCurrentUser, requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CuratorDashboard } from '@/components/curator/Dashboard'

export default async function CuratorDashboardPage() {
  const user = await getCurrentUser()
  
  try {
    requireRole(user, 'CURATOR')
  } catch (error) {
    redirect('/unauthorized')
  }

  return <CuratorDashboard user={{ name: user?.fullName || 'Curator' }} />
} 