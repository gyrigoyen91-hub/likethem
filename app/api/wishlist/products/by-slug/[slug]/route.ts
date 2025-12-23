import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/wishlist/products/by-slug/[slug] - Get wishlist status by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ isSaved: false })
    }

    const { slug } = await params

    // Resolve slug to product ID
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json({ isSaved: false })
    }

    const wishlistItem = await (prisma as any).wishlistItem.findFirst({
      where: {
        userId: session.user.id,
        productId: product.id,
      },
    })

    return NextResponse.json({ isSaved: !!wishlistItem })
  } catch (error: any) {
    console.error('[api][wishlist-status] Error:', error)
    return NextResponse.json({ isSaved: false })
  }
}

// POST /api/wishlist/products/by-slug/[slug] - Add to wishlist by slug
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { slug } = await params

    // Resolve slug to product ID
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, isActive: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      )
    }

    // Create wishlist item
    try {
      await (prisma as any).wishlistItem.create({
        data: {
          userId: session.user.id,
          productId: product.id,
        },
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        return NextResponse.json({ isSaved: true })
      }
      throw error
    }

    return NextResponse.json({ isSaved: true })
  } catch (error: any) {
    console.error('[api][wishlist-add] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save to wishlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/wishlist/products/by-slug/[slug] - Remove from wishlist by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { slug } = await params

    // Resolve slug to product ID
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    await (prisma as any).wishlistItem.deleteMany({
      where: {
        userId: session.user.id,
        productId: product.id,
      },
    })

    return NextResponse.json({ isSaved: false })
  } catch (error: any) {
    console.error('[api][wishlist-remove] Error:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}
