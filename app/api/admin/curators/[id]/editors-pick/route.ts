import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/requireAdmin'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = `editors-pick-toggle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const { userId: adminUserId } = await requireAdmin()
    const { id } = await params
    
    const body = await request.json()
    const { isEditorsPick } = body

    if (typeof isEditorsPick !== 'boolean') {
      return NextResponse.json(
        { error: 'isEditorsPick must be a boolean' },
        { status: 400 }
      )
    }

    // Verify curator profile exists
    const profile = await prisma.curatorProfile.findUnique({
      where: { id },
      select: { id: true, storeName: true, isEditorsPick: true },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Curator profile not found' },
        { status: 404 }
      )
    }

    // Update editor's pick
    await prisma.curatorProfile.update({
      where: { id },
      data: { isEditorsPick },
    })

    console.log(`[ADMIN_CURATOR_EDITORS_PICK][${correlationId}]`, {
      adminUserId,
      curatorProfileId: id,
      storeName: profile.storeName,
      oldValue: profile.isEditorsPick,
      newValue: isEditorsPick,
    })

    return NextResponse.json({
      ok: true,
      message: "Editor's pick updated successfully",
      curatorProfileId: id,
      isEditorsPick,
    })
  } catch (error) {
    console.error(`[ADMIN_CURATOR_EDITORS_PICK][${correlationId}][ERROR]`, error)
    
    if (error instanceof Error && error.message.includes('redirect')) {
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
