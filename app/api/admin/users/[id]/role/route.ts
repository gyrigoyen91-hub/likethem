import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/requireAdmin'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = `role-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const { userId: adminUserId } = await requireAdmin()
    const { id } = await params
    
    const body = await request.json()
    const { role } = body

    // Validate role
    if (!['BUYER', 'CURATOR', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be BUYER, CURATOR, or ADMIN' },
        { status: 400 }
      )
    }

    // Get current user to log role change
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true, email: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const oldRole = user.role

    // Update role
    await prisma.user.update({
      where: { id },
      data: { role },
    })

    console.log(`[ADMIN_ROLE_UPDATE][${correlationId}]`, {
      adminUserId,
      targetUserId: id,
      targetUserEmail: user.email,
      oldRole,
      newRole: role,
    })

    return NextResponse.json({
      ok: true,
      message: 'Role updated successfully',
      userId: id,
      oldRole,
      newRole: role,
    })
  } catch (error) {
    console.error(`[ADMIN_ROLE_UPDATE][${correlationId}][ERROR]`, error)
    
    if (error instanceof Error && error.message.includes('redirect')) {
      // requireAdmin redirected - return 403
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
