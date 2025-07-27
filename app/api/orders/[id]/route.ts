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

    // Transform the updated order data to handle Date objects and null values
    const transformedOrder = {
      ...updatedOrder,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      items: updatedOrder.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          curatorNote: item.product.curatorNote ?? undefined,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
        }
      })),
      buyer: {
        ...updatedOrder.buyer,
        fullName: updatedOrder.buyer.fullName ?? undefined,
      },
      curator: {
        ...updatedOrder.curator,
        bio: updatedOrder.curator.bio ?? undefined,
        bannerImage: updatedOrder.curator.bannerImage ?? undefined,
        instagram: updatedOrder.curator.instagram ?? undefined,
        tiktok: updatedOrder.curator.tiktok ?? undefined,
        youtube: updatedOrder.curator.youtube ?? undefined,
        twitter: updatedOrder.curator.twitter ?? undefined,
        user: {
          ...updatedOrder.curator.user,
          fullName: updatedOrder.curator.user.fullName ?? undefined,
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: transformedOrder
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

    // Transform the order data to handle Date objects and null values
    const transformedOrder = {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          curatorNote: item.product.curatorNote ?? undefined,
          createdAt: item.product.createdAt.toISOString(),
          updatedAt: item.product.updatedAt.toISOString(),
          images: item.product.images.map(image => ({
            ...image,
            altText: image.altText ?? undefined,
          }))
        }
      })),
      buyer: {
        ...order.buyer,
        fullName: order.buyer.fullName ?? undefined,
      },
      curator: {
        ...order.curator,
        bio: order.curator.bio ?? undefined,
        bannerImage: order.curator.bannerImage ?? undefined,
        instagram: order.curator.instagram ?? undefined,
        tiktok: order.curator.tiktok ?? undefined,
        youtube: order.curator.youtube ?? undefined,
        twitter: order.curator.twitter ?? undefined,
        user: {
          ...order.curator.user,
          fullName: order.curator.user.fullName ?? undefined,
        }
      }
    }

    return NextResponse.json({ order: transformedOrder })

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
} 