import { notFound, redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase-server'
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

    const s = getSupabaseServer()
    const { data: curator, error } = await s
      .from('curator_profiles')
      .select('id, slug, "isPublic", storeName, bio, bannerImage')
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

    const description = (curator as any).bio || `Discover unique fashion curated by ${(curator as any).storeName}`
    const imageUrl = (curator as any).bannerImage || ''

    return {
      title: `${(curator as any).storeName} - Curator`,
      description: description.substring(0, 160),
      openGraph: {
        title: `${(curator as any).storeName} - Curator`,
        description: description.substring(0, 160),
        images: imageUrl ? [imageUrl] : [],
        type: 'profile',
        url: `/curator/${(curator as any).slug}`
      },
      twitter: {
        card: 'summary_large_image',
        title: `${(curator as any).storeName} - Curator`,
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

    const s = getSupabaseServer()
    
    // Fetch curator by slug first, with fallback to id
    const { data: curator, error: curatorError } = await s
      .from('curator_profiles')
      .select('id, slug, "isPublic", storeName, bio, bannerImage, instagram, tiktok, youtube, twitter, "createdAt", "updatedAt"')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single()

    if (curatorError || !curator) {
      console.log('[curator][page] Curator not found:', { error: curatorError, slug })
      notFound()
    }

    // Only block if explicitly private
    if ((curator as any).isPublic === false) {
      console.log('[curator][page] Curator is not public:', { id: (curator as any).id, isPublic: (curator as any).isPublic })
      notFound()
    }

    console.log('[curator][page] Found curator:', { id: (curator as any).id, storeName: (curator as any).storeName, isPublic: (curator as any).isPublic })

    // Canonical redirect: if accessed via ID/UUID and has slug, redirect to slug URL
    if ((curator as any).slug && (numericId || isUuid) && slug !== (curator as any).slug) {
      console.log('[curator][page] Redirecting to canonical slug URL:', { from: slug, to: (curator as any).slug })
      redirect(`/curator/${(curator as any).slug}`)
    }

    const curatorId = (curator as any).id

    // Fetch products for this curator
    const { data: itemsRaw, error: itemsErr } = await s
      .from('products')
      .select('id, title, description, price, "isActive", "createdAt", slug')
      .eq('curatorId', curatorId)
      .eq('isActive', true)
      .order('createdAt', { ascending: false })

    if (itemsErr) console.error('[curator/products] err', itemsErr)

    // Get images for those products
    let imagesByProduct = new Map<string, { url: string; altText: string | null }>()
    if (itemsRaw && itemsRaw.length) {
      const ids = (itemsRaw as any[]).map(i => i.id)
      const { data: imgs } = await s
        .from('product_images')
        .select('productId, url, altText, "order"')
        .in('productId', ids)
        .order('order', { ascending: true })

      if (imgs) {
        for (const img of (imgs as any[])) {
          if (!imagesByProduct.has(img.productId)) {
            imagesByProduct.set(img.productId, { url: img.url, altText: img.altText ?? null })
          }
        }
      }
    }

    const items = ((itemsRaw as any[]) ?? []).map(p => ({
      id: p.id,
      title: p.title,
      description: p.description ?? '',
      price: p.price ?? 0,
      slug: p.slug ?? p.id,
      image: imagesByProduct.get(p.id)?.url ?? null,
      imageAlt: imagesByProduct.get(p.id)?.altText ?? p.title,
    }))

    console.log('[curator][page] Products loaded:', { count: items.length, items: items.map(i => ({ id: i.id, title: i.title, hasImage: !!i.image })) })

    // Transform the data to match the expected Curator interface
    const transformedCurator = {
      id: (curator as any).id,
      slug: (curator as any).slug,
      storeName: (curator as any).storeName,
      bio: (curator as any).bio ?? undefined,
      bannerImage: (curator as any).bannerImage ?? undefined,
      instagram: (curator as any).instagram ?? undefined,
      tiktok: (curator as any).tiktok ?? undefined,
      youtube: (curator as any).youtube ?? undefined,
      twitter: (curator as any).twitter ?? undefined,
      isPublic: (curator as any).isPublic,
      isEditorsPick: false, // Default value
      createdAt: (curator as any).createdAt,
      updatedAt: (curator as any).updatedAt,
      user: {
        id: (curator as any).id,
        fullName: 'Gonzalo Yrigoyen', // We'll fetch this from users table if needed
        avatar: undefined,
      },
      products: items.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        category: 'Fashion', // Default value
        tags: 'curated', // Default value
        sizes: 'M,L,XL', // Default value
        colors: 'Various', // Default value
        stockQuantity: 1, // Default value
        curatorNote: undefined,
        slug: product.slug,
        images: product.image ? [{
          id: `img-${product.id}`,
          url: product.image,
          altText: product.imageAlt,
          order: 1
        }] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    }

    const description = (curator as any).bio || `Discover unique fashion curated by ${(curator as any).storeName}`
    const imageUrl = (curator as any).bannerImage || ''

    console.log('[curator][page] Successfully loaded curator with products:', {
      id: (curator as any).id,
      storeName: (curator as any).storeName,
      productCount: items.length
    })

    return (
      <>
        <CuratorSEO
          name={(curator as any).storeName}
          description={description}
          image={imageUrl || undefined}
          slug={(curator as any).slug}
        />

        <CuratorDetailClient curator={transformedCurator} />
      </>
    )
  } catch (error) {
    console.error('[curator][page] Error loading curator:', error)
    notFound()
  }
}