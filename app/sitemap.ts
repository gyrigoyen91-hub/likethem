import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { serializePrisma } from '@/lib/serialize'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://likethem.io'

  try {
    // Fetch all public curators with minimal fields
    const curators = await prisma.curatorProfile.findMany({
      where: {
        isPublic: true
      },
      select: {
        slug: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Serialize to handle any potential BigInt/Decimal issues
    const safeCurators = serializePrisma(curators)

    // Generate sitemap entries for curators
    const curatorEntries: MetadataRoute.Sitemap = safeCurators.map((curator) => ({
      url: `${baseUrl}/curator/${curator.slug}`,
      lastModified: new Date(curator.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/explore`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/auth/signin`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/auth/signup`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]

    return [...staticPages, ...curatorEntries]
  } catch (error) {
    console.error('[sitemap] Error generating sitemap:', error)
    
    // Return basic sitemap on error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}
