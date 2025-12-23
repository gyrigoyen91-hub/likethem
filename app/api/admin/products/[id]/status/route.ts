import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/requireAdmin'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const correlationId = `product-status-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const { userId: adminUserId } = await requireAdmin()
    const { id } = await params
    
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!['ACTIVE', 'HIDDEN', 'FLAGGED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACTIVE, HIDDEN, or FLAGGED' },
        { status: 400 }
      )
    }

    // Get current product to log change
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, title: true, isActive: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const oldStatus = product.isActive ? 'ACTIVE' : 'INACTIVE'
    const newIsActive = status === 'ACTIVE'

    // Update product status
    await prisma.product.update({
      where: { id },
      data: { isActive: newIsActive },
    })

    console.log(`[ADMIN_PRODUCT_STATUS][${correlationId}]`, {
      adminUserId,
      productId: id,
      productTitle: product.title,
      oldStatus,
      newStatus: status,
    })

    return NextResponse.json({
      ok: true,
      message: 'Product status updated successfully',
      productId: id,
      oldStatus,
      newStatus: status,
    })
  } catch (error) {
    console.error(`[ADMIN_PRODUCT_STATUS][${correlationId}][ERROR]`, error)
    
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
