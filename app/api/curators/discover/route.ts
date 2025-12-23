import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds

type SortOption = 'editors-pick' | 'popular' | 'newest' | 'alphabetical'
type PriceRange = 'under-100' | '100-300' | '300-plus'

interface DiscoverParams {
  q?: string
  cursor?: string
  limit?: number
  style?: string[] // Comma-separated tags
  city?: string
  country?: string
  priceRange?: PriceRange
  sort?: SortOption
}

/**
 * Get price ranges for multiple curators in a single query (optimized)
 */
async function getCuratorPriceRanges(curatorIds: string[]): Promise<Map<string, { min: number | null; max: number | null }>> {
  if (curatorIds.length === 0) {
    return new Map()
  }

  const products = await prisma.product.findMany({
    where: {
      curatorId: { in: curatorIds },
      isActive: true,
    },
    select: {
      curatorId: true,
      price: true,
    },
  })

  // Group by curatorId and compute min/max
  const ranges = new Map<string, { min: number | null; max: number | null }>()
  
  // Initialize all curators with null
  curatorIds.forEach(id => {
    ranges.set(id, { min: null, max: null })
  })

  // Compute ranges
  products.forEach(p => {
    const existing = ranges.get(p.curatorId) || { min: null, max: null }
    if (existing.min === null || p.price < existing.min) {
      existing.min = p.price
    }
    if (existing.max === null || p.price > existing.max) {
      existing.max = p.price
    }
    ranges.set(p.curatorId, existing)
  })

  return ranges
}

/**
 * Check if curator matches price range filter
 */
function matchesPriceRange(min: number | null, max: number | null, range: PriceRange): boolean {
  if (min === null || max === null) return false

  switch (range) {
    case 'under-100':
      return max < 100
    case '100-300':
      return min <= 300 && max >= 100
    case '300-plus':
      return min >= 300
    default:
      return true
  }
}

/**
 * Parse tags from string (comma-separated or JSON array)
 */
function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return []
  try {
    const parsed = JSON.parse(tags)
    if (Array.isArray(parsed)) {
      return parsed.filter((t): t is string => typeof t === 'string')
    }
  } catch {
    // Not JSON, try comma-separated
    return tags.split(',').map(t => t.trim()).filter(Boolean)
  }
  return []
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    const limitParam = Number(searchParams.get('limit') || '24')
    const params: DiscoverParams = {
      q: searchParams.get('q')?.trim() || undefined,
      cursor: searchParams.get('cursor') || undefined,
      limit: Math.min(limitParam, 48),
      style: searchParams.get('style')?.split(',').filter(Boolean) || undefined,
      city: searchParams.get('city') || undefined,
      country: searchParams.get('country') || undefined,
      priceRange: (searchParams.get('priceRange') as PriceRange) || undefined,
      sort: (searchParams.get('sort') as SortOption) || 'editors-pick',
    }

    // Build base query
    let where: any = {
      isPublic: true,
    }

    // Text search
    if (params.q) {
      where.OR = [
        { storeName: { contains: params.q, mode: 'insensitive' } },
        { slug: { contains: params.q, mode: 'insensitive' } },
        { bio: { contains: params.q, mode: 'insensitive' } },
      ]
    }

    // Location filters (if fields exist in schema)
    // Note: These fields may not exist yet, so we'll filter post-query if needed
    // For now, we'll try to use them if they exist
    try {
      if (params.city) {
        where.city = { contains: params.city, mode: 'insensitive' }
      }
      if (params.country) {
        where.country = { contains: params.country, mode: 'insensitive' }
      }
    } catch {
      // Fields don't exist, will filter post-query
    }

    // Style tags filter (if tags field exists, otherwise we'll filter post-query)
    // Note: Since tags might not exist in schema yet, we'll handle it in post-processing

    // Build orderBy based on sort option
    let orderBy: any[] = []
    switch (params.sort) {
      case 'editors-pick':
        orderBy = [
          { isEditorsPick: 'desc' },
          { createdAt: 'desc' },
        ]
        break
      case 'popular':
        // Note: followersCount might not exist in schema, will sort post-query
        orderBy = [
          { createdAt: 'desc' },
        ]
        break
      case 'newest':
        orderBy = [{ createdAt: 'desc' }]
        break
      case 'alphabetical':
        orderBy = [{ storeName: 'asc' }]
        break
    }

    // Fetch curators
    const curators = await prisma.curatorProfile.findMany({
      where,
      orderBy,
      take: 200, // Fetch more to account for post-filtering (filters may reduce results)
      include: {
        user: {
          select: {
            avatar: true,
          },
        },
        products: {
          where: { isActive: true },
          select: {
            price: true,
            tags: true, // For style tag filtering
            images: {
              take: 1,
              orderBy: { order: 'asc' },
              select: { url: true },
            },
          },
          take: 10, // Get more products for tag aggregation
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    // Post-process: apply sorting (if needed), filter by style tags, location, and price range
    let filtered = [...curators]

    // Apply sorting for 'popular' if followersCount doesn't exist in schema
    if (params.sort === 'popular') {
      filtered.sort((a, b) => {
        const aFollowers = (a as any).followersCount || 0
        const bFollowers = (b as any).followersCount || 0
        if (aFollowers !== bFollowers) {
          return bFollowers - aFollowers
        }
        return b.createdAt.getTime() - a.createdAt.getTime()
      })
    }

    // Filter by location (post-query since fields may not exist in schema)
    if (params.city || params.country) {
      filtered = filtered.filter(curator => {
        const curatorCity = (curator as any).city
        const curatorCountry = (curator as any).country
        
        if (params.city) {
          if (!curatorCity || !curatorCity.toLowerCase().includes(params.city.toLowerCase())) {
            return false
          }
        }
        
        if (params.country) {
          if (!curatorCountry || !curatorCountry.toLowerCase().includes(params.country.toLowerCase())) {
            return false
          }
        }
        
        return true
      })
    }

    // Filter by style tags (if provided)
    if (params.style && params.style.length > 0) {
      filtered = filtered.filter(curator => {
        // Try to get tags from curator profile (if field exists)
        // Otherwise, aggregate from products
        let curatorTags: string[] = []
        
        // Check if curator has tags field (might not exist in schema yet)
        const curatorTagsField = (curator as any).tags
        if (curatorTagsField) {
          curatorTags = parseTags(curatorTagsField)
        } else {
          // Aggregate tags from products
          const productTags = curator.products.flatMap(p => {
            const productTagsField = (p as any).tags
            return parseTags(productTagsField)
          })
          curatorTags = Array.from(new Set(productTags)) // Unique tags
        }

        // Check if any filter tag matches
        return params.style!.some(filterTag =>
          curatorTags.some(tag => tag.toLowerCase() === filterTag.toLowerCase())
        )
      })
    }

    // Filter by price range (if provided) - batch query for performance
    if (params.priceRange) {
      const curatorIds = filtered.map(c => c.id)
      const priceRanges = await getCuratorPriceRanges(curatorIds)
      
      filtered = filtered.filter(curator => {
        const priceRange = priceRanges.get(curator.id) || { min: null, max: null }
        return matchesPriceRange(priceRange.min, priceRange.max, params.priceRange!)
      })
    }

    // Apply cursor-based pagination after filtering
    let paginated = filtered
    if (params.cursor) {
      const cursorIndex = paginated.findIndex(c => c.id === params.cursor)
      if (cursorIndex >= 0) {
        paginated = paginated.slice(cursorIndex + 1)
      }
    }
    
    // Limit results
    const limit = params.limit || 24
    const hasMore = paginated.length > limit
    const items = paginated.slice(0, limit)

    // Batch compute price ranges for all items
    const itemIds = items.map(c => c.id)
    const priceRanges = await getCuratorPriceRanges(itemIds)

    // Get current user's follow status (if authenticated)
    let userFollows: Set<string> = new Set()
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        const follows = await (prisma as any).follow.findMany({
          where: {
            userId: session.user.id,
            curatorId: { in: itemIds },
          },
          select: { curatorId: true },
        })
        userFollows = new Set(follows.map((f: any) => f.curatorId))
      }
    } catch (error) {
      // Silently fail - follow status is optional
      console.error('[discover] Error fetching follow status:', error)
    }

    // Format response
    const result = items.map(curator => {
      // Get hero image (banner or latest product image)
      let hero = curator.bannerImage
      if (!hero && curator.products.length > 0) {
        hero = curator.products[0].images[0]?.url || null
      }

      // Get price range from batch result
      const priceRange = priceRanges.get(curator.id) || { min: null, max: null }

      // Get avatar
      const avatar = curator.user?.avatar || null

      // Parse style tags
      let styleTags: string[] = []
      const styleTagsField = (curator as any).styleTags
      if (styleTagsField) {
        try {
          const parsed = JSON.parse(styleTagsField)
          if (Array.isArray(parsed)) {
            styleTags = parsed
          }
        } catch {
          // Not JSON, ignore
        }
      }

      return {
        id: curator.id,
        slug: curator.slug,
        name: curator.storeName,
        avatar,
        city: (curator as any).city || null,
        country: (curator as any).country || null,
        styleTags: styleTags.length > 0 ? styleTags : null,
        followers: (curator as any).followersCount || null,
        hero,
        postUrl: null, // Not in current schema
        createdAt: curator.createdAt.toISOString(),
        isEditorsPick: curator.isEditorsPick,
        isFollowing: userFollows.has(curator.id),
        priceRange: priceRange.min !== null && priceRange.max !== null
          ? { min: priceRange.min, max: priceRange.max }
          : null,
      }
    })

    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].id : null

    return NextResponse.json({
      items: result,
      nextCursor,
    })
  } catch (error) {
    console.error('[discover] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch curators', items: [], nextCursor: null },
      { status: 500 }
    )
  }
}
