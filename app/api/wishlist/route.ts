import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/wishlist - Get user's wishlist items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const wishlistItems = await (prisma as any).wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: {
              orderBy: { order: 'asc' },
              take: 1,
            },
            curator: {
              select: {
                slug: true,
                storeName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter out inactive products and format response
    const items = wishlistItems
      .filter((item: any) => item.product.isActive)
      .map((item: any) => ({
        id: item.id,
        productId: item.product.id,
        productSlug: item.product.slug,
        title: item.product.title,
        price: item.product.price,
        imageUrl: item.product.images[0]?.url || null,
        curatorSlug: item.product.curator.slug,
        curatorName: item.product.curator.storeName,
        createdAt: item.createdAt.toISOString(),
      }))

    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('[api][wishlist] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}
