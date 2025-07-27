import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/search - Search across products and curators
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') // 'all', 'products', 'curators'
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = query.trim()
    const results: any[] = []

    // Search products
    if (!type || type === 'all' || type === 'products') {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { category: { contains: searchTerm } }
          ]
        },
        include: {
          curator: {
            select: {
              storeName: true
            }
          }
        },
        take: limit
      })

      results.push(...products.map(product => ({
        id: product.id,
        type: 'product',
        title: product.title,
        subtitle: `Curated by ${product.curator.storeName}`,
        price: product.price,
        category: product.category,
        curatorName: product.curator.storeName
      })))
    }

    // Search curators
    if (!type || type === 'all' || type === 'curators') {
      const curators = await prisma.curatorProfile.findMany({
        where: {
          isPublic: true,
          OR: [
            { storeName: { contains: searchTerm } },
            { bio: { contains: searchTerm } }
          ]
        },
        include: {
          user: {
            select: {
              fullName: true,
              avatar: true
            }
          },
          _count: {
            select: {
              products: {
                where: { isActive: true }
              }
            }
          }
        },
        take: limit
      })

      results.push(...curators.map(curator => ({
        id: curator.id,
        type: 'curator',
        title: curator.storeName,
        subtitle: `${curator._count.products} products`,
        image: curator.user.avatar || null,
        bio: curator.bio,
        isEditorsPick: curator.isEditorsPick
      })))
    }

    // Sort results by relevance (products first, then curators)
    const sortedResults = results.sort((a, b) => {
      const typeOrder = { product: 0, curator: 1 }
      return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder]
    })

    return NextResponse.json({
      results: sortedResults.slice(0, limit),
      total: sortedResults.length,
      query: searchTerm
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 