import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serializePrisma } from '@/lib/serialize'
import { CuratorSEO } from '@/components/SEO'
import { CuratorImage } from '@/components/OptimizedImage'
import CuratorDetailClient from '@/components/CuratorDetailClient'

const parseIdOrSlug = (param: string) => {
  const n = Number(param)
  const numericId = Number.isFinite(n) && String(n) === param ? n : undefined
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(param)
  return { numericId, isUuid, slug: param }
}

interface CuratorPageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  // Return empty array to prevent build-time database access
  // Pages will be generated dynamically at runtime
  return []
}

export async function generateMetadata({ params }: CuratorPageProps) {
  try {
    const { numericId, isUuid, slug } = parseIdOrSlug(params.slug)
    console.log('[curator][metadata] Parsed params:', { numericId, isUuid, slug, original: params.slug })

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
            fullName: true
          }
        }
      }
    })

    if (!curator || !curator.isPublic) {
      return {
        title: 'Curator Not Found',
        description: 'The requested curator could not be found.'
      }
    }

    const description = curator.bio || `Discover unique fashion curated by ${curator.storeName}`
    const imageUrl = curator.bannerImage || ''

    return {
      title: `${curator.storeName} - Curator`,
      description: description.substring(0, 160),
      openGraph: {
        title: `${curator.storeName} - Curator`,
        description: description.substring(0, 160),
        images: imageUrl ? [imageUrl] : [],
        type: 'profile',
        url: `/curator/${curator.slug}`
      },
      twitter: {
        card: 'summary_large_image',
        title: `${curator.storeName} - Curator`,
        description: description.substring(0, 160),
        images: imageUrl ? [imageUrl] : []
      }
    }
  } catch (error) {
    console.error('[curator][metadata] Error:', error)
    return {
      title: 'Curator Not Found',
      description: 'The requested curator could not be found.'
    }
  }
}

export default async function CuratorPage({ params }: CuratorPageProps) {
  try {
    const { numericId, isUuid, slug } = parseIdOrSlug(params.slug)
    console.log('[curator][page] Parsed params:', { numericId, isUuid, slug, original: params.slug })

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

    if (!curator || !curator.isPublic) {
      console.log('[curator][page] Curator not found or not public:', { slug, isPublic: curator?.isPublic })
      notFound()
    }

    // Canonical redirect: if accessed via ID/UUID and has slug, redirect to slug URL
    if (curator.slug && (numericId || isUuid) && slug !== curator.slug) {
      console.log('[curator][page] Redirecting to canonical slug URL:', { from: slug, to: curator.slug })
      redirect(`/curator/${curator.slug}`)
    }

    // Transform the data to match the expected Curator interface
    const transformedCurator = {
      ...curator,
      bio: curator.bio ?? undefined,
      bannerImage: curator.bannerImage ?? undefined,
      instagram: curator.instagram ?? undefined,
      tiktok: curator.tiktok ?? undefined,
      youtube: curator.youtube ?? undefined,
      twitter: curator.twitter ?? undefined,
      user: {
        ...curator.user,
        fullName: curator.user.fullName ?? undefined,
        avatar: curator.user.avatar ?? undefined,
      },
      products: curator.products.map(product => ({
        ...product,
        curatorNote: product.curatorNote ?? undefined,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
        images: product.images.map(image => ({
          ...image,
          altText: image.altText ?? undefined,
        })),
      })),
    }

    // Serialize to handle any BigInt/Decimal issues
    const safeCurator = serializePrisma(transformedCurator)

    const description = curator.bio || `Discover unique fashion curated by ${curator.storeName}`
    const imageUrl = curator.bannerImage || ''

    console.log('[curator][page] Successfully loaded curator:', { 
      id: curator.id, 
      storeName: curator.storeName, 
      productCount: curator.products.length 
    })

    return (
      <>
        <CuratorSEO
          name={curator.storeName}
          description={description}
          image={imageUrl || undefined}
          slug={curator.slug}
        />
        
        <CuratorDetailClient curator={safeCurator} />
      </>
    )
  } catch (error) {
    console.error('[curator][page] Error loading curator:', error)
    notFound()
  }
} 