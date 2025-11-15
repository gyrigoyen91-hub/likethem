'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { UserRole } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallback = <div>Loading...</div>,
  redirectTo = '/auth/signin'
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    // Check if user is authenticated
    if (!session?.user) {
      router.push(redirectTo)
      return
    }

    // Check role if required
    if (requiredRole) {
      const userRole = session.user.role as UserRole
      const roleHierarchy: Record<UserRole, number> = {
        'BUYER': 1,
        'CURATOR': 2,
        'ADMIN': 3
      }

      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        router.push('/unauthorized')
        return
      }
    }
  }, [session, status, requiredRole, router, redirectTo])

  // Show loading while checking authentication
  if (status === 'loading') {
    return <>{fallback}</>
  }

  // Show loading while redirecting
  if (!session?.user) {
    return <>{fallback}</>
  }

  // Check role if required
  if (requiredRole) {
    const userRole = session.user.role as UserRole
    const roleHierarchy: Record<UserRole, number> = {
      'BUYER': 1,
      'CURATOR': 2,
      'ADMIN': 3
    }

    if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
} 