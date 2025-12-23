import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { PrismaClient } from '@prisma/client'
import { UserRole } from './auth'

const prisma = new PrismaClient()

export interface ApiUser {
  id: string
  email: string
  role: UserRole
  fullName?: string
  curatorProfileId?: string
}

export async function getApiUser(req: NextRequest): Promise<ApiUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        curatorProfile: {
          select: {
            id: true
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
      curatorProfileId: user.curatorProfile?.id
    }
  } catch (error) {
    console.error('Error getting API user:', error)
    return null
  }
}

export function requireApiAuth(user: ApiUser | null): ApiUser {
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

export function requireApiRole(user: ApiUser | null, role: UserRole): ApiUser {
  const authenticatedUser = requireApiAuth(user)
  
  const roleHierarchy: Record<UserRole, number> = {
    'BUYER': 1,
    'CURATOR': 2,
    'ADMIN': 3
  }
  
  if (roleHierarchy[authenticatedUser.role] < roleHierarchy[role]) {
    throw new Error(`Access denied. Required role: ${role}`)
  }
  
  return authenticatedUser
}

export function createApiErrorResponse(message: string, status: number = 401): NextResponse {
  return NextResponse.json(
    { error: message },
    { status }
  )
}

export function createApiSuccessResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json(data, { status })
}

// Helper function to ensure curators only access their own data
export function ensureCuratorOwnership(user: ApiUser, curatorId: string): void {
  if (user.role === 'CURATOR' && user.curatorProfileId !== curatorId) {
    throw new Error('Access denied. You can only access your own data.')
  }
}

// Helper function to ensure users only access their own data
export function ensureUserOwnership(user: ApiUser, userId: string): void {
  if (user.id !== userId && user.role !== 'ADMIN') {
    throw new Error('Access denied. You can only access your own data.')
  }
} 