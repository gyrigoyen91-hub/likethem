import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiAuth, createApiErrorResponse, createApiSuccessResponse } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

// GET - Fetch user's cart items
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Require authentication (any authenticated user can access their cart)
    requireApiAuth(user)

    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: user.id
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: {
                order: 'asc'
              }
            },
            curator: {
              select: {
                storeName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the frontend CartItem interface
    const transformedItems = cartItems.map(item => ({
      id: item.id,
      name: item.product.title,
      curator: item.product.curator.storeName,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images[0]?.url || '',
      size: item.size,
      color: item.color,
      productId: item.productId
    }))

    return createApiSuccessResponse({ items: transformedItems })

  } catch (error) {
    console.error('Error fetching cart:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 403)
    }
    return createApiErrorResponse('Failed to fetch cart', 500)
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Require authentication (any authenticated user can add to cart)
    requireApiAuth(user)

    const body = await request.json()
    const { productId, quantity = 1, size, color } = body

    if (!productId) {
      return createApiErrorResponse('Product ID is required', 400)
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        curator: {
          select: {
            storeName: true
          }
        }
      }
    })

    if (!product) {
      return createApiErrorResponse('Product not found', 404)
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId: productId,
        size: size || null,
        color: color || null
      }
    })

    let cartItem

    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  order: 'asc'
                }
              },
              curator: {
                select: {
                  storeName: true
                }
              }
            }
          }
        }
      })
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
          size: size || null,
          color: color || null
        },
        include: {
          product: {
            include: {
              images: {
                orderBy: {
                  order: 'asc'
                }
              },
              curator: {
                select: {
                  storeName: true
                }
              }
            }
          }
        }
      })
    }

    // Transform the response
    const transformedItem = {
      id: cartItem.id,
      name: cartItem.product.title,
      curator: cartItem.product.curator.storeName,
      price: cartItem.product.price,
      quantity: cartItem.quantity,
      image: cartItem.product.images[0]?.url || '',
      size: cartItem.size,
      color: cartItem.color,
      productId: cartItem.productId
    }

    return createApiSuccessResponse({
      success: true,
      item: transformedItem,
      message: 'Item added to cart'
    })

  } catch (error) {
    console.error('Error adding to cart:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Failed to add item to cart', 500)
  }
}

// PUT - Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Require authentication (any authenticated user can update their cart)
    requireApiAuth(user)

    const body = await request.json()
    const { itemId, quantity } = body

    if (!itemId || quantity === undefined) {
      return createApiErrorResponse('Item ID and quantity are required', 400)
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await prisma.cartItem.delete({
        where: {
          id: itemId,
          userId: user.id // Ensure user owns the item
        }
      })

      return createApiSuccessResponse({
        success: true,
        message: 'Item removed from cart'
      })
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        id: itemId,
        userId: user.id // Ensure user owns the item
      },
      data: { quantity },
      include: {
        product: {
          include: {
            images: {
              orderBy: {
                order: 'asc'
              }
            },
            curator: {
              select: {
                storeName: true
              }
            }
          }
        }
      }
    })

    const transformedItem = {
      id: cartItem.id,
      name: cartItem.product.title,
      curator: cartItem.product.curator.storeName,
      price: cartItem.product.price,
      quantity: cartItem.quantity,
      image: cartItem.product.images[0]?.url || '',
      size: cartItem.size,
      color: cartItem.color,
      productId: cartItem.productId
    }

    return createApiSuccessResponse({
      success: true,
      item: transformedItem,
      message: 'Cart updated'
    })

  } catch (error) {
    console.error('Error updating cart:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Failed to update cart', 500)
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Require authentication (any authenticated user can remove from cart)
    requireApiAuth(user)

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return createApiErrorResponse('Item ID is required', 400)
    }

    await prisma.cartItem.delete({
      where: {
        id: itemId,
        userId: user.id // Ensure user owns the item
      }
    })

    return createApiSuccessResponse({
      success: true,
      message: 'Item removed from cart'
    })

  } catch (error) {
    console.error('Error removing from cart:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Failed to remove item from cart', 500)
  }
} 