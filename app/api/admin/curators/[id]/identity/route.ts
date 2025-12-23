import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/requireAdmin'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const ALLOWED_STYLE_TAGS = [
  'streetwear',
  'vintage',
  'minimal',
  'luxury',
  'casual',
  'formal',
  'sporty',
  'bohemian',
] as const

type AllowedTag = typeof ALLOWED_STYLE_TAGS[number]

/**
 * Validate URL format
 */
function isValidUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === '') return true // Empty is valid (will be null)
  return url.startsWith('https://') || url.startsWith('http://')
}

/**
 * Validate style tags against allowlist
 */
function validateStyleTags(tags: string[] | null | undefined): string[] | null {
  if (!tags || tags.length === 0) return null
  
  const validTags = tags.filter(tag => 
    ALLOWED_STYLE_TAGS.includes(tag.toLowerCase() as AllowedTag)
  )
  
  return validTags.length > 0 ? validTags : null
}

/**
 * Normalize string: trim and convert empty to null
 */
function normalizeString(value: string | null | undefined, maxLength?: number): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed === '') return null
  if (maxLength && trimmed.length > maxLength) {
    return trimmed.substring(0, maxLength)
  }
  return trimmed
}

interface IdentityUpdateBody {
  bio?: string | null
  city?: string | null
  country?: string | null
  styleTags?: string[] | null
  instagramUrl?: string | null
  tiktokUrl?: string | null
  youtubeUrl?: string | null
  websiteUrl?: string | null
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    
    const { id } = await params
    const body: IdentityUpdateBody = await request.json()

    // Validate curator exists
    const curator = await prisma.curatorProfile.findUnique({
      where: { id },
    })

    if (!curator) {
      return NextResponse.json(
        { error: 'Curator not found' },
        { status: 404 }
      )
    }

    // Validate and normalize inputs
    const bio = normalizeString(body.bio, 280)
    const city = normalizeString(body.city)
    const country = normalizeString(body.country)
    const styleTags = validateStyleTags(body.styleTags)
    
    // Validate URLs
    const urls = {
      instagramUrl: normalizeString(body.instagramUrl),
      tiktokUrl: normalizeString(body.tiktokUrl),
      youtubeUrl: normalizeString(body.youtubeUrl),
      websiteUrl: normalizeString(body.websiteUrl),
    }

    const urlErrors: string[] = []
    if (urls.instagramUrl && !isValidUrl(urls.instagramUrl)) {
      urlErrors.push('Instagram URL must start with https:// or http://')
    }
    if (urls.tiktokUrl && !isValidUrl(urls.tiktokUrl)) {
      urlErrors.push('TikTok URL must start with https:// or http://')
    }
    if (urls.youtubeUrl && !isValidUrl(urls.youtubeUrl)) {
      urlErrors.push('YouTube URL must start with https:// or http://')
    }
    if (urls.websiteUrl && !isValidUrl(urls.websiteUrl)) {
      urlErrors.push('Website URL must start with https:// or http://')
    }

    if (urlErrors.length > 0) {
      return NextResponse.json(
        { error: urlErrors.join(', ') },
        { status: 400 }
      )
    }

    // Update curator profile
    const updated = await prisma.curatorProfile.update({
      where: { id },
      data: {
        bio,
        city: city as any, // Temporary: Prisma client needs regeneration
        country: country as any, // Temporary: Prisma client needs regeneration
        styleTags: (styleTags ? JSON.stringify(styleTags) : null) as any, // Temporary: Prisma client needs regeneration
        instagramUrl: urls.instagramUrl as any, // Temporary: Prisma client needs regeneration
        tiktokUrl: urls.tiktokUrl as any, // Temporary: Prisma client needs regeneration
        youtubeUrl: urls.youtubeUrl as any, // Temporary: Prisma client needs regeneration
        websiteUrl: urls.websiteUrl as any, // Temporary: Prisma client needs regeneration
      } as any,
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    })

    return NextResponse.json({
      ok: true,
      curator: {
        id: updated.id,
        storeName: updated.storeName,
        bio: updated.bio,
        city: (updated as any).city,
        country: (updated as any).country,
        styleTags: (updated as any).styleTags ? JSON.parse((updated as any).styleTags) : null,
        instagramUrl: (updated as any).instagramUrl,
        tiktokUrl: (updated as any).tiktokUrl,
        youtubeUrl: (updated as any).youtubeUrl,
        websiteUrl: (updated as any).websiteUrl,
      },
    })
  } catch (error: any) {
    console.error('[admin][curator-identity] Error:', error)
    
    if (error.message?.includes('Unauthorized') || error.message?.includes('Access denied')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update curator identity' },
      { status: 500 }
    )
  }
}
