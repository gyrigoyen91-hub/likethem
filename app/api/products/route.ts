import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, requireApiRole, createApiErrorResponse, createApiSuccessResponse, ensureCuratorOwnership } from '@/lib/api-auth'
import { PrismaClient } from '@prisma/client'
import { generateUniqueSlug } from '@/lib/slugify'

// IMPORTANT: Prisma requires Node.js runtime
export const runtime = 'nodejs';

const prisma = new PrismaClient()

// GET /api/products - Get all products for the logged-in curator
export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can access their products
    requireApiRole(user, 'CURATOR')

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Get products for this curator
    const products = await prisma.product.findMany({
      where: { curatorId: curatorProfile.id },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return createApiSuccessResponse(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 403)
    }
    return createApiErrorResponse('Internal server error', 500)
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user) {
      return createApiErrorResponse('Unauthorized')
    }

    // Only curators can create products
    requireApiRole(user, 'CURATOR')

    const {
      title,
      description,
      price,
      category,
      tags,
      sizes,
      colors,
      stockQuantity,
      curatorNote,
      images
    } = await request.json()

    // Validation
    if (!title || !description || !price || !category) {
      return createApiErrorResponse('Missing required fields', 400)
    }

    if (!images || images.length === 0) {
      return createApiErrorResponse('At least one image is required', 400)
    }

    if (images.length > 5) {
      return createApiErrorResponse('Maximum 5 images allowed', 400)
    }

    // Get curator profile
    const curatorProfile = await prisma.curatorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!curatorProfile) {
      return createApiErrorResponse('Curator profile not found', 404)
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(title, 'product')

    // Create product with transaction
    const product = await prisma.$transaction(async (tx: any) => {
      // Create product
      const newProduct = await tx.product.create({
        data: {
          curatorId: curatorProfile.id,
          title,
          description,
          price: parseFloat(price),
          category,
          tags: tags || '',
          sizes: sizes || '',
          colors: colors || '',
          stockQuantity: parseInt(stockQuantity) || 0,
          curatorNote: curatorNote || null,
          slug
        }
      })

      // Create product images
      const productImages = await Promise.all(
        images.map((image: any, index: number) =>
          tx.productImage.create({
            data: {
              productId: newProduct.id,
              url: image.url,
              altText: image.altText || '',
              order: index
            }
          })
        )
      )

      return {
        ...newProduct,
        images: productImages
      }
    })

    return createApiSuccessResponse({
      message: 'Product created successfully',
      product
    })

  } catch (error) {
    console.error('Error creating product:', error)
    if (error instanceof Error) {
      return createApiErrorResponse(error.message, 500)
    }
    return createApiErrorResponse('Internal server error', 500)
  }
} 