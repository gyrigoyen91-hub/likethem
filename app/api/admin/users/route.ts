import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only admins can access user data
    requireApiRole(user, 'ADMIN')

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        curatorProfile: {
          select: {
            storeName: true,
            isPublic: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return createApiSuccessResponse({ users })

  } catch (error) {
    console.error('Error fetching users:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 403)
    }
    return createApiErrorResponse('Internal server error', 500)
  }
}

// POST /api/admin/users - Create or update user role (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only admins can modify user roles
    requireApiRole(user, 'ADMIN')

    const { userId, role } = await request.json()

    if (!userId || !role) {
      return createApiErrorResponse('User ID and role are required', 400)
    }

    // Validate role
    if (!['ADMIN', 'CURATOR', 'BUYER'].includes(role)) {
      return createApiErrorResponse('Invalid role', 400)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true
      }
    })

    return createApiSuccessResponse({
      message: 'User role updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  }
} 