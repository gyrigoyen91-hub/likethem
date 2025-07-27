import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '../auth/[...nextauth]/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      items,
      shippingAddress,
      paymentMethod,
      transactionCode,
      paymentProof
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Shipping address required' }, { status: 400 })
    }

    // Calculate totals
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })

      if (!product) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 })
      }

      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color
      })
    }

    // Calculate commission (example: 10% platform fee)
    const commission = totalAmount * 0.10
    const curatorAmount = totalAmount - commission

    // Determine order status based on payment method
    const status = paymentMethod === 'stripe' ? 'PENDING' : 'PENDING_PAYMENT'

    // Create order with transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          buyerId: session.user.id,
          curatorId: items[0].curatorId, // Assuming all items are from same curator
          status,
          totalAmount,
          commission,
          curatorAmount,
          paymentMethod,
          transactionCode,
          paymentProof,
          shippingAddress: {
            create: {
              fullName: shippingAddress.fullName,
              email: shippingAddress.email,
              phone: shippingAddress.phone,
              address: shippingAddress.address,
              city: shippingAddress.city,
              state: shippingAddress.state,
              zipCode: shippingAddress.zipCode,
              country: shippingAddress.country
            }
          },
          items: {
            create: orderItems
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          shippingAddress: true,
          curator: {
            include: {
              user: true
            }
          }
        }
      })

      // Clear cart items for this user
      await tx.cartItem.deleteMany({
        where: {
          userId: session.user.id,
          productId: {
            in: items.map((item: any) => item.productId)
          }
        }
      })

      return newOrder
    })

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod
      }
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = session.user.role

    let whereClause: any = {}

    if (role === 'BUYER') {
      whereClause.buyerId = session.user.id
    } else if (role === 'CURATOR') {
      whereClause.curatorId = session.user.curatorProfileId
    }

    if (status) {
      whereClause.status = status
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
} 