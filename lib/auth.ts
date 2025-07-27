import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export type UserRole = 'ADMIN' | 'CURATOR' | 'BUYER'

export interface CurrentUser {
  id: string
  email: string
  role: UserRole
  fullName?: string
  avatar?: string
  curatorProfileId?: string
  storeName?: string
  isPublic?: boolean
  isEditorsPick?: boolean
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        curatorProfile: {
          select: {
            id: true,
            storeName: true,
            isPublic: true,
            isEditorsPick: true
          }
        }
      }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.fullName || undefined,
      avatar: user.avatar || undefined,
      curatorProfileId: user.curatorProfile?.id,
      storeName: user.curatorProfile?.storeName,
      isPublic: user.curatorProfile?.isPublic,
      isEditorsPick: user.curatorProfile?.isEditorsPick
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export function hasRole(user: CurrentUser | null, requiredRole: UserRole): boolean {
  if (!user) return false
  
  const roleHierarchy: Record<UserRole, number> = {
    'BUYER': 1,
    'CURATOR': 2,
    'ADMIN': 3
  }
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

export function isAdmin(user: CurrentUser | null): boolean {
  return hasRole(user, 'ADMIN')
}

export function isCurator(user: CurrentUser | null): boolean {
  return hasRole(user, 'CURATOR')
}

export function isBuyer(user: CurrentUser | null): boolean {
  return hasRole(user, 'BUYER')
}

export function requireAuth(user: CurrentUser | null): CurrentUser {
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export function requireRole(user: CurrentUser | null, role: UserRole): CurrentUser {
  const authenticatedUser = requireAuth(user)
  if (!hasRole(authenticatedUser, role)) {
    throw new Error(`Access denied. Required role: ${role}`)
  }
  return authenticatedUser
} 