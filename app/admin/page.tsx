import { getCurrentUser, requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  const user = await getCurrentUser()
  
  try {
    requireRole(user, 'ADMIN')
  } catch (error) {
    redirect('/unauthorized')
  }

  return <AdminDashboard userName={user?.fullName} />
} 