import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../../auth/[...nextauth]/auth'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status } = body

    // Find the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        buyer: true,
        curator: {
          include: {
            user: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if user has permission to update this order
    const isBuyer = order.buyerId === session.user.id
    const isCurator = order.curatorId === session.user.curatorProfileId
    const isAdmin = session.user.role === 'ADMIN'

    if (!isBuyer && !isCurator && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true
          }
        },
        shippingAddress: true,
        buyer: true,
        curator: {
          include: {
            user: true
          }
        }
      }
    })

    // TODO: Send email notifications when status changes
    // if (status === 'PAID') {
    //   // Send email to buyer
    // }
    // if (status === 'PENDING_PAYMENT') {
    //   // Send email to curator
    // }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        shippingAddress: true,
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        curator: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if user has permission to view this order
    const isBuyer = order.buyerId === session.user.id
    const isCurator = order.curatorId === session.user.curatorProfileId
    const isAdmin = session.user.role === 'ADMIN'

    if (!isBuyer && !isCurator && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
} 