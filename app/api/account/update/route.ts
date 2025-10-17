import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fullName } = body
    // TODO: Add phone field after production DB migration

    // Validate input
    if (fullName && typeof fullName !== 'string') {
      return NextResponse.json({ error: 'Invalid fullName' }, { status: 400 })
    }

    // Update user in database - only safe fields for now
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(fullName !== undefined && { fullName: fullName || null }),
        // TODO: Add phone field after production DB migration
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatar: true,
        role: true,
        // TODO: Add phone field after production DB migration
      }
    })

    console.log('[account] User updated:', { userId: session.user.id, fullName })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    })

  } catch (error) {
    console.error('[account] Update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
