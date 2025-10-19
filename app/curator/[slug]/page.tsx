import { notFound } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase-server'
import { CuratorSEO } from '@/components/SEO'
import CuratorHero from '@/components/curator/CuratorHero'
import CategoryChips, { Category } from '@/components/curator/CategoryChips'
import ProductCard, { ProductCardData } from '@/components/curator/ProductCard'
import EmptyState from '@/components/curator/EmptyState'
import FiltersSheet from '@/components/curator/FiltersSheet'

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
  category?: string;
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
    console.log('[curator][page] Parsed params:', { numericId, isUuid, slug, original: params.slug })

    const s = getSupabaseServer()
    
    // 1) Fetch curator allowing id OR slug
    const { data: curator, error: curatorError } = await s
      .from('curator_profiles')
      .select('*')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single()

    if (curatorError) {
      console.error('[curator/page] error', curatorError)
      notFound()
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

    console.log('[curator/page] params.slug =', params.slug)
    console.log('[curator/page] curator =', (curator as any)?.id, (curator as any)?.slug, (curator as any)?.isPublic)

    console.log('[curator][page] Found curator:', { id: (curator as any).id, storeName: (curator as any).storeName })

    // 2) Products + first image with server-side filtering
    let q = s
      .from('products')
      .select(`
        id, title, price, slug, category, isFeatured, createdAt,
        product_images!inner (
          url, "order"
        )
      `)
      .eq('curatorId', (curator as any).id)
      .eq('isActive', true)

    // Apply filters server-side
    const { category, min, max, sort } = searchParams
    if (category && category !== 'all') {
      q = q.eq('category', category)
    }
    if (min) q = q.gte('price', Number(min))
    if (max) q = q.lte('price', Number(max))

    // Apply sorting
    if (sort === 'price-asc') q = q.order('price', { ascending: true })
    else if (sort === 'price-desc') q = q.order('price', { ascending: false })
    else q = q.order('createdAt', { ascending: false })

    const { data: productsRaw } = await q

    const products: ProductCardData[] =
      ((productsRaw as any[]) || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price ?? 0),
        slug: p.slug ?? null,
        imageUrl:
          (Array.isArray(p.product_images) && p.product_images[0]?.url) || null,
        isFeatured: !!p.isFeatured,
        createdAt: p.createdAt,
        category: p.category ?? null,
      })) ?? []

    // 3) Category counts from database view (more efficient)
    let categories: Category[] = []
    try {
      const { data: counts } = await s
        .from('v_curator_category_counts')
        .select('category, count')
        .eq('curatorId', (curator as any).id)

      categories = (counts as any[] || []).map((c: any) => ({
        name: c.category || "Other",
        count: c.count || 0
      }))
    } catch (error) {
      // Fallback to in-memory calculation if view doesn't exist
      console.warn('[curator] Category view not found, using fallback calculation:', error)
      const categoriesMap = new Map<string, number>()
      for (const p of (productsRaw as any[]) || []) {
        const name = p.category || "Other"
        categoriesMap.set(name, (categoriesMap.get(name) || 0) + 1)
      }
      categories = Array.from(categoriesMap.entries()).map(([name, count]) => ({ name, count }))
    }

    // Split products into featured and regular
    const featured = products.filter(p => p.isFeatured)
    const regular = products.filter(p => !p.isFeatured)

    const description = (curator as any).bio || `Discover unique fashion curated by ${(curator as any).storeName}`
    const imageUrl = (curator as any).bannerImage || ''

    console.log('[curator][page] Successfully loaded curator with products:', {
      id: (curator as any).id,
      storeName: (curator as any).storeName,
      totalProducts: products.length,
      featuredCount: featured.length,
      regularCount: regular.length
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

          {/* Editor's Picks */}
          {featured.length > 0 && (
            <section className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Editor's Picks</h3>
                <span className="text-sm text-gray-500">{featured.length} item{featured.length > 1 ? "s" : ""}</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Top toolbar */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Curated Collection{" "}
              <span className="text-gray-500">({regular.length} {regular.length === 1 ? "item" : "items"})</span>
            </h2>
            <div className="flex items-center gap-2">
              <FiltersSheet />
            </div>
          </div>

          {/* Category chips */}
          {categories.length > 0 && <CategoryChips categories={categories} />}

          {/* Filters row (simple inline for now) */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {category && category !== "all" ? `Showing "${category}"` : "All categories"}
            </div>
          </div>

          {/* Main grid (non-featured) or Empty */}
          {regular.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {regular.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState name={(curator as any).storeName ?? "This curator"} />
          )}
        </div>
      </>
    )
  } catch (error) {
    console.error('[curator][page] Error loading curator:', error)
    notFound()
  }
} 