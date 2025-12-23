import { getCurrentUser, requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'
import { getAdminDashboardStats } from '@/lib/admin/stats'

// Cache stats for 60 seconds to avoid hitting DB on every request
export const revalidate = 60

export default async function AdminPage() {
  const user = await getCurrentUser()
  
  try {
    requireRole(user, 'ADMIN')
  } catch (error) {
    redirect('/unauthorized')
  }

  // Fetch real stats from database
  const stats = await getAdminDashboardStats()

  return <AdminDashboard userName={user?.fullName ?? undefined} stats={stats} />
} 