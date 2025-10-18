import { notFound, redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CuratorSEO } from '@/components/SEO'
import { CuratorImage } from '@/components/OptimizedImage'
import CuratorDetailClient from '@/components/CuratorDetailClient'

// Make the route dynamic to prevent caching 404s for newly created curators
export const dynamic = 'force-dynamic'
export const revalidate = 0

const parseIdOrSlug = (param: string) => {
  const n = Number(param)
  const numericId = Number.isFinite(n) && String(n) === param ? n : undefined
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(param)
  return { numericId, isUuid, slug: param }
}

interface CuratorPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: CuratorPageProps) {
  try {
    const { numericId, isUuid, slug } = parseIdOrSlug(params.slug)
    console.log('[curator][metadata] Parsed params:', { numericId, isUuid, slug, original: params.slug })

    const { data: curator, error } = await supabase
      .from('curator_profiles')
      .select(`
        *,
        user:users(fullName)
      `)
      .or(`id.eq.${slug},slug.eq.${slug}`)
      .eq('isPublic', true)
      .single()

    if (error || !curator) {
      console.log('[curator][metadata] Curator not found:', { error, slug })
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

    const { data: curator, error } = await supabase
      .from('curator_profiles')
      .select(`
        *,
        user:users(id, fullName, avatar),
        products:products!curatorId(
          id,
          title,
          description,
          price,
          category,
          tags,
          sizes,
          colors,
          stockQuantity,
          isFeatured,
          curatorNote,
          slug,
          createdAt,
          updatedAt,
          images:product_images(
            id,
            url,
            altText,
            order
          )
        )
      `)
      .or(`id.eq.${slug},slug.eq.${slug}`)
      .eq('isPublic', true)
      .single()

    if (error || !curator) {
      console.log('[curator][page] Curator not found:', { error, slug })
      notFound()
    }

    // Check if curator is public - if not, return 404
    if (!curator.isPublic) {
      console.log('[curator][page] Curator is not public:', { id: curator.id, isPublic: curator.isPublic })
      notFound()
    }

    // Filter active products and sort by creation date
    const activeProducts = curator.products
      ?.filter((product: any) => product.isActive)
      ?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      ?.map((product: any) => ({
        ...product,
        images: product.images?.sort((a: any, b: any) => a.order - b.order) || []
      })) || []

    console.log('[curator][page] Found curator:', { 
      id: curator.id, 
      storeName: curator.storeName, 
      productCount: activeProducts.length,
      isPublic: curator.isPublic
    })

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
        fullName: curator.user?.fullName ?? undefined,
        avatar: curator.user?.avatar ?? undefined,
      },
      products: activeProducts.map((product: any) => ({
        ...product,
        curatorNote: product.curatorNote ?? undefined,
        createdAt: new Date(product.createdAt).toISOString(),
        updatedAt: new Date(product.updatedAt).toISOString(),
        images: product.images.map((image: any) => ({
          ...image,
          altText: image.altText ?? undefined,
        })),
      })),
    }

    const description = curator.bio || `Discover unique fashion curated by ${curator.storeName}`
    const imageUrl = curator.bannerImage || ''

    console.log('[curator][page] Successfully loaded curator:', { 
      id: curator.id, 
      storeName: curator.storeName, 
      productCount: activeProducts.length 
    })

    return (
      <>
        <CuratorSEO
          name={curator.storeName}
          description={description}
          image={imageUrl || undefined}
          slug={curator.slug}
        />
        
        <CuratorDetailClient curator={transformedCurator} />
      </>
    )
  } catch (error) {
    console.error('[curator][page] Error loading curator:', error)
    notFound()
  }
} 