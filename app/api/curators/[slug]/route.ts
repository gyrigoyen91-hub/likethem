import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/curators/[slug] - Get curator profile and products (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Decode the URL parameter to handle %20 and other encoded characters
    const decodedSlug = decodeURIComponent(params.slug)
    console.log('Looking for curator with slug:', decodedSlug)

    // Find curator by slug
    const curator = await prisma.curatorProfile.findUnique({
      where: { slug: decodedSlug },
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
          include: {
            images: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!curator) {
      console.log('Curator not found')
      return NextResponse.json(
        { error: 'Curator not found' },
        { status: 404 }
      )
    }

    // Only return public curators
    if (!curator.isPublic) {
      console.log('Curator is not public')
      return NextResponse.json(
        { error: 'Curator not found' },
        { status: 404 }
      )
    }

    console.log('Found curator:', curator.storeName, 'with', curator.products.length, 'products')

    return NextResponse.json({
      curator: {
        id: curator.id,
        storeName: curator.storeName,
        bio: curator.bio,
        bannerImage: curator.bannerImage,
        instagram: curator.instagram,
        tiktok: curator.tiktok,
        youtube: curator.youtube,
        twitter: curator.twitter,
        isEditorsPick: curator.isEditorsPick,
        slug: curator.slug,
        user: curator.user,
        products: curator.products.map(product => ({
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          category: product.category,
          tags: product.tags,
          sizes: product.sizes,
          colors: product.colors,
          stockQuantity: product.stockQuantity,
          curatorNote: product.curatorNote,
          slug: product.slug,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          images: product.images
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching curator:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 