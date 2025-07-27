import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/products/[slug] - Get a specific product by slug (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        curator: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Only return active products for public access
    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Transform the product data to handle Date objects and null values
    const transformedProduct = {
      ...product,
      curatorNote: product.curatorNote ?? undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      curator: {
        ...product.curator,
        bio: product.curator.bio ?? undefined,
        user: {
          ...product.curator.user,
          fullName: product.curator.user.fullName ?? undefined,
        }
      },
      images: product.images.map(image => ({
        ...image,
        altText: image.altText ?? undefined,
      }))
    }

    return NextResponse.json(transformedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 