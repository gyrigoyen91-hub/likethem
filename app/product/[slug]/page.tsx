import { notFound } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase-server'
import { checkAccessServer } from '@/lib/access/checkAccessServer'
import { ProductSEO } from '@/components/SEO'
import ProductDetailClient from '@/components/ProductDetailClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps) {
  try {
    const supabase = getSupabaseServer()
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id, title, description, price, slug, category, visibility, curatorNote, tags,
        curator:curator_profiles(storeName, slug),
        product_images(url, "order")
      `)
      .eq('slug', params.slug)
      .eq('isActive', true)
      .single()

    if (error || !product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product could not be found.'
      }
    }

    const description = (product as any).curatorNote || (product as any).description || ''
    const imageUrl = (product as any).product_images?.[0]?.url || ''
    const tags = (product as any).tags ? (product as any).tags.split(',').map((tag: string) => tag.trim()) : []

    return {
      title: (product as any).title,
      description: description.substring(0, 160),
      openGraph: {
        title: (product as any).title,
        description: description.substring(0, 160),
        images: imageUrl ? [imageUrl] : [],
        type: 'website',
        url: `/product/${(product as any).slug}`
      },
      twitter: {
        card: 'summary_large_image',
        title: (product as any).title,
        description: description.substring(0, 160),
        images: imageUrl ? [imageUrl] : []
      }
    }
  } catch (error) {
    console.error('[product][metadata] Error:', error)
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    const supabase = getSupabaseServer()
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id, title, description, price, slug, category, visibility, curatorNote, tags, createdAt, updatedAt,
        curatorId,
        curator:curator_profiles(id, storeName, bio, slug, user:users(fullName)),
        product_images(url, "order", altText)
      `)
      .eq('slug', params.slug)
      .eq('isActive', true)
      .single()

    if (error || !product) {
      console.log('[product][page] Product not found:', params.slug)
      notFound()
    }

    // Check access for inner tier products
    const hasAccess = (product as any).visibility === 'inner' 
      ? await checkAccessServer((product as any).curatorId)
      : true

    // Transform the product data to match the expected Product interface
    const transformedProduct = {
      id: (product as any).id,
      title: (product as any).title,
      description: (product as any).description,
      price: Number((product as any).price),
      slug: (product as any).slug,
      category: (product as any).category,
      curatorNote: (product as any).curatorNote,
      tags: (product as any).tags,
      visibility: (product as any).visibility,
      createdAt: (product as any).createdAt,
      updatedAt: (product as any).updatedAt,
      curator: {
        id: (product as any).curator?.id,
        storeName: (product as any).curator?.storeName,
        bio: (product as any).curator?.bio,
        slug: (product as any).curator?.slug,
        user: {
          fullName: (product as any).curator?.user?.fullName,
        }
      },
      images: ((product as any).product_images || []).map((image: any) => ({
        id: image.id || '',
        url: image.url,
        altText: image.altText,
        order: image.order || 0,
      }))
    }

    const description = (product as any).curatorNote || (product as any).description || ''
    const imageUrl = (product as any).product_images?.[0]?.url || ''
    const tags = (product as any).tags ? (product as any).tags.split(',').map((tag: string) => tag.trim()) : []

    console.log('[product][page] Loaded product:', {
      id: (product as any).id,
      title: (product as any).title,
      visibility: (product as any).visibility,
      hasAccess,
      curatorId: (product as any).curatorId
    })

    return (
      <>
        <ProductSEO
          title={(product as any).title}
          description={description}
          price={Number((product as any).price)}
          image={imageUrl}
          slug={(product as any).slug}
          curator={(product as any).curator?.storeName}
          category={(product as any).category}
          tags={tags}
        />
        
        <ProductDetailClient 
          product={transformedProduct} 
          hasAccess={hasAccess}
          isInnerTier={(product as any).visibility === 'inner'}
        />
      </>
    )
  } catch (error) {
    console.error('[product][page] Error loading product:', error)
    notFound()
  }
} 