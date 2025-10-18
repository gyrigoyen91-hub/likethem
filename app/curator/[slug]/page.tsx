import { notFound } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase-server'
import { CuratorSEO } from '@/components/SEO'
import CuratorHero from '@/components/curator/CuratorHero'
import CategoryChips, { Category } from '@/components/curator/CategoryChips'
import ProductCard, { ProductCardData } from '@/components/curator/ProductCard'
import EmptyState from '@/components/curator/EmptyState'
import FiltersSheet from '@/components/curator/FiltersSheet'

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
    
    // 1) Curator
    const { data: curator, error: curatorError } = await s
      .from('curator_profiles')
      .select('id, storeName, bio, bannerImage, isEditorsPick, slug, "isPublic"')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .maybeSingle()

    if (curatorError || !curator) {
      console.log('[curator][page] Curator not found:', { error: curatorError, slug })
    notFound()
  }

    // treat isPublic === false as private; null/true are visible
    if ((curator as any).isPublic === false) {
      console.log('[curator][page] Curator is not public:', { id: (curator as any).id, isPublic: (curator as any).isPublic })
      notFound()
    }

    console.log('[curator][page] Found curator:', { id: (curator as any).id, storeName: (curator as any).storeName })

    // 2) Products + first image
    const { data: productsRaw } = await s
      .from('products')
      .select(`
        id, title, price, slug, category, isFeatured,
        product_images!inner (
          url, "order"
        )
      `)
      .eq('curatorId', (curator as any).id)
      .eq('isActive', true)

    const products: ProductCardData[] =
      ((productsRaw as any[]) || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: Number(p.price ?? 0),
        slug: p.slug ?? null,
        imageUrl:
          (Array.isArray(p.product_images) && p.product_images[0]?.url) || null,
      })) ?? []

    // 3) Category counts
    const categoriesMap = new Map<string, number>()
    for (const p of (productsRaw as any[]) || []) {
      const name = p.category || "Other"
      categoriesMap.set(name, (categoriesMap.get(name) || 0) + 1)
    }
    const categories: Category[] = Array.from(categoriesMap.entries()).map(([name, count]) => ({ name, count }))

    // 4) Filter in-memory for now (DB filter can come later)
    let filtered = [...products]
    const { category, min, max, sort } = searchParams
    if (category && category !== "all") {
      filtered = filtered.filter((p) => (productsRaw as any[] || []).find((x: any) => x.id === p.id)?.category === category)
    }
    if (min) filtered = filtered.filter((p) => p.price >= Number(min))
    if (max) filtered = filtered.filter((p) => p.price <= Number(max))
    if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price)
    if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price)
    if (sort === "new") filtered = filtered // assume default order is createdAt desc in DB; can add later

    const description = (curator as any).bio || `Discover unique fashion curated by ${(curator as any).storeName}`
    const imageUrl = (curator as any).bannerImage || ''

    console.log('[curator][page] Successfully loaded curator with products:', {
      id: (curator as any).id,
      storeName: (curator as any).storeName,
      productCount: filtered.length
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
              avatarUrl: null, // optional: join users.image if you want
            }}
          />

          {/* Top toolbar */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Curated Collection{" "}
              <span className="text-gray-500">({filtered.length} {filtered.length === 1 ? "item" : "items"})</span>
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

          {/* Grid or Empty */}
          {filtered.length === 0 ? (
            <EmptyState name={(curator as any).storeName ?? "This curator"} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </>
    )
  } catch (error) {
    console.error('[curator][page] Error loading curator:', error)
    notFound()
  }
} 