import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { prisma } from '@/lib/prisma'
import { serializePrisma } from '@/lib/serialize'

const parseIdOrSlug = (param: string) => {
  const n = Number(param)
  const numericId = Number.isFinite(n) && String(n) === param ? n : undefined
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(param)
  return { numericId, isUuid, slug: param }
}

export async function GET(
  request: Request,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    // Gate: Only allow in development or for admin users
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      const session = await getServerSession(authOptions)
      const isAdmin = session?.user?.role === 'ADMIN'
      
      if (!isAdmin) {
        return NextResponse.json({ 
          error: 'Not found' 
        }, { status: 404 })
      }
    }

    const { numericId, isUuid, slug } = parseIdOrSlug(params.idOrSlug)
    
    console.log('[debug][curator] Parsed params:', { numericId, isUuid, slug, original: params.idOrSlug })

    const curator = await prisma.curatorProfile.findFirst({
      where: {
        OR: [
          ...(isUuid ? [{ id: slug }] : []),
          { slug },
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true
          }
        },
        products: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            category: true,
            tags: true,
            sizes: true,
            colors: true,
            stockQuantity: true,
            isFeatured: true,
            curatorNote: true,
            slug: true,
            createdAt: true,
            updatedAt: true,
            images: {
              select: {
                id: true,
                url: true,
                altText: true,
                order: true
              },
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!curator) {
      return NextResponse.json({ 
        error: 'Curator not found',
        params: { numericId, isUuid, slug, original: params.idOrSlug }
      }, { status: 404 })
    }

    // Serialize the response to handle BigInt/Decimal issues
    const safeCurator = serializePrisma(curator)

    return NextResponse.json({ 
      curator: safeCurator,
      params: { numericId, isUuid, slug, original: params.idOrSlug },
      isPublic: curator.isPublic,
      productCount: curator.products.length
    })

  } catch (error) {
    console.error('[debug][curator] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      params: { original: params.idOrSlug }
    }, { status: 500 })
  }
}
