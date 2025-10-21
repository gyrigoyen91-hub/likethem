import { notFound } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase-server'
import { checkAccessServer } from '@/lib/access/checkAccessServer'
import { CuratorSEO } from '@/components/SEO'
import CuratorHero from '@/components/curator/CuratorHero'
import CuratorTabs from './CuratorTabs'
import ClosetSectionWrapper from '@/components/curator/ClosetSectionWrapper'
import { 
  getMockCuratorBySlug, 
  getMockProductsByCurator, 
  getMockActiveDrop, 
  getMockProductCounts 
} from '@/lib/mock-data'

// Ensure Node.js runtime for Supabase service key access
export const runtime = 'nodejs'
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
      .select('*')
      .or(`id.eq.${slug},slug.eq.${slug}`)
      .single()

    if (error) {
      console.error('[curator][metadata] error', error)
      return {
        title: 'Curator Not Found',
        description: 'The requested curator could not be found.'
      }
    }

    if (!curator) {
      console.log('[curator][metadata] Curator not found for slug:', slug)
      return {
        title: 'Curator Not Found',
        description: 'The requested curator could not be found.'
      }
    }

    // Only gate on isPublic === false
    if ((curator as any).isPublic === false) {
      console.log('[curator][metadata] Curator is not public:', { id: (curator as any).id, isPublic: (curator as any).isPublic })
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

type Search = {
  t?: 'general' | 'inner' | 'drops';
  tab?: 'general' | 'inner' | 'drops'; // Keep for backward compatibility
  cat?: string;
  category?: string; // Keep for backward compatibility
  min?: string;
  max?: string;
  sort?: "new" | "price-asc" | "price-desc";
};

export default async function CuratorPage({ 
  params, 
  searchParams 
}: { 
  params: { slug: string }; 
  searchParams: Search; 
}) {
  try {
    const { numericId, isUuid, slug } = parseIdOrSlug(params.slug)
    const tab = searchParams.t || searchParams.tab || 'general'
    const selectedCategory = searchParams.cat || searchParams.category || null
    console.log('[curator:slug] incoming', slug)
    console.log('[curator][page] Parsed params:', { numericId, isUuid, slug, original: params.slug, tab, selectedCategory })

    let curator: any = null
    let useMockData = false

    try {
      const s = getSupabaseServer()
      
      // 1) Fetch curator allowing id OR slug
      const { data: curatorData, error: curatorError } = await s
        .from('curator_profiles')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single()

      if (curatorError) {
        console.error('[curator/page] Supabase error, falling back to mock data:', curatorError)
        useMockData = true
      } else {
        curator = curatorData
      }
    } catch (error) {
      console.error('[curator/page] Supabase connection failed, using mock data:', error)
      useMockData = true
    }

    // Fallback to mock data if Supabase fails
    if (useMockData) {
      curator = getMockCuratorBySlug(slug)
      if (!curator) {
        console.log('[curator/page] Curator not found in mock data for slug:', slug)
        notFound()
      }
    }
    
    if (!curator) {
      console.log('[curator/page] Curator not found for slug:', slug)
    notFound()
  }

    // Only gate on isPublic === false
    if ((curator as any).isPublic === false) {
      console.log('[curator/page] Curator is not public:', { id: (curator as any).id, isPublic: (curator as any).isPublic })
      notFound()
    }

    console.log('[curator][page] Found curator:', { id: (curator as any).id, storeName: (curator as any).storeName, useMockData })

    // 2) Get tab counts and active drop
    let generalCount, innerCount, dropCount, activeDrop, products

    if (useMockData) {
      // Use mock data
      const counts = getMockProductCounts((curator as any).id)
      generalCount = { count: counts.general }
      innerCount = { count: counts.inner }
      dropCount = { count: counts.drop }
      activeDrop = { data: getMockActiveDrop((curator as any).id) }
      
      // Get products based on tab
      const allProducts = getMockProductsByCurator((curator as any).id)
      if (tab === 'general') {
        products = allProducts.filter(p => p.visibility === 'general')
      } else if (tab === 'inner') {
        products = allProducts.filter(p => p.visibility === 'inner')
      } else if (tab === 'drops') {
        products = allProducts.filter(p => p.visibility === 'drop')
      } else {
        products = allProducts
      }
    } else {
      // Use Supabase (when available)
      const s = getSupabaseServer()
      const [generalCountResult, innerCountResult, dropCountResult] = await Promise.all([
        s.from('products')
          .select('id', { count: 'exact', head: true })
          .eq('curatorId', (curator as any).id)
          .eq('isActive', true),
        s.from('products')
          .select('id', { count: 'exact', head: true })
          .eq('curatorId', (curator as any).id)
          .eq('isActive', true),
        Promise.resolve({ count: 0 }) // No drops yet
      ])

      generalCount = generalCountResult
      innerCount = innerCountResult
      dropCount = dropCountResult
      activeDrop = { data: null }
      
      // Fetch products from Supabase
      let productsQuery = s
        .from('products')
        .select(`
          id, title, price, slug, category, createdAt,
          product_images (
            url, "order"
          )
        `)
        .eq('curatorId', (curator as any).id)
        .eq('isActive', true)

      const { data: productsRaw } = await productsQuery
      products = ((productsRaw as any[]) || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price ?? 0),
        slug: p.slug ?? null,
        imageUrl: (Array.isArray(p.product_images) && p.product_images[0]?.url) || null,
        category: p.category ?? null,
        createdAt: p.createdAt,
        visibility: 'general' // Temporary default until visibility system is implemented
      }))
    }

    // 3) Check access for inner tier
    const hasAccess = await checkAccessServer((curator as any).id)

    // Apply sorting to products
    const { sort } = searchParams
    if (sort === 'price-asc') {
      products.sort((a, b) => a.price - b.price)
    } else if (sort === 'price-desc') {
      products.sort((a, b) => b.price - a.price)
    } else {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    // 5) Prepare tabs data
    const tabs = [
      { key: 'general', label: 'General', count: generalCount.count ?? 0 },
      { key: 'inner', label: 'Inner', count: innerCount.count ?? 0 },
      { key: 'drops', label: 'Drops', count: dropCount },
    ]

    const description = (curator as any).bio || `Discover unique fashion curated by ${(curator as any).storeName}`
    const imageUrl = (curator as any).bannerImage || ''

    console.log('[curator][page] Successfully loaded curator with 3-tier system:', {
      id: (curator as any).id,
      storeName: (curator as any).storeName,
      tab,
      hasAccess,
      generalCount: generalCount.count,
      innerCount: innerCount.count,
      dropCount,
      activeDrop: !!activeDrop.data
    })

  return (
    <>
      <CuratorSEO
          name={(curator as any).storeName}
        description={description}
        image={imageUrl || undefined}
          slug={(curator as any).slug}
        />

        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
          <CuratorHero
            curator={{
              id: (curator as any).id,
              storeName: (curator as any).storeName,
              bio: (curator as any).bio,
              bannerImage: (curator as any).bannerImage || null,
              isEditorsPick: (curator as any).isEditorsPick || false,
              slug: (curator as any).slug,
              avatarUrl: (curator as any).user?.image || null,
            }}
          />

          {/* Tabs */}
          <CuratorTabs tabs={tabs} curatorSlug={(curator as any).slug} />

          {/* Tab Content */}
          <div className="mt-8">
            <ClosetSectionWrapper
              tier={tab === 'general' ? 'PUBLIC' : tab === 'inner' ? 'INNER' : 'DROP'}
              curatorId={(curator as any).id}
              curatorName={(curator as any).storeName}
              hasAccess={hasAccess}
              activeDrop={activeDrop.data}
              products={products}
              useMockData={useMockData}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error('[curator][page] Error loading curator:', error)
    notFound()
  }
} 