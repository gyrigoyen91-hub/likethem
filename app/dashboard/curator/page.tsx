import { getCurrentUser, requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CuratorDashboard from '@/components/CuratorDashboard'

export default async function CuratorDashboardPage() {
  const user = await getCurrentUser()
  
  try {
    requireRole(user, 'CURATOR')
  } catch (error) {
    redirect('/unauthorized')
  }

  const curator = {
    name: user?.fullName || 'Curator',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    storeName: user?.storeName || 'My Store',
    isEditorPick: user?.isEditorsPick || false
  }

  return <CuratorDashboard curator={curator} />
} 