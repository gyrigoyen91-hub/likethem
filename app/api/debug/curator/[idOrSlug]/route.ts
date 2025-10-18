import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    // Gate: Only allow in development or for admin users
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      const session = await getServerSession(authOptions)
      const isAdmin = session?.user?.role === 'ADMIN'
      
      if (!isAdmin) {
        return NextResponse.json({ 
          error: 'Not found' 
        }, { status: 404 })
      }
    }

    console.log('[debug][curator] Looking up curator:', { idOrSlug: params.idOrSlug })

    const { data, error } = await supabase
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
          isActive,
          images:product_images(
            id,
            url,
            altText,
            order
          )
        )
      `)
      .or(`id.eq.${params.idOrSlug},slug.eq.${params.idOrSlug}`)
      .eq('isPublic', true)
      .single()

    if (error || !data) {
      console.log('[debug][curator] Curator not found:', { error, idOrSlug: params.idOrSlug })
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Filter active products and sort by creation date
    const activeProducts = data.products
      ?.filter((product: any) => product.isActive)
      ?.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      ?.map((product: any) => ({
        ...product,
        images: product.images?.sort((a: any, b: any) => a.order - b.order) || []
      })) || []

    console.log('[debug][curator] Found curator:', { 
      id: data.id, 
      storeName: data.storeName, 
      productCount: activeProducts.length,
      isPublic: data.isPublic
    })

    return NextResponse.json({ 
      found: true, 
      data: {
        ...data,
        products: activeProducts
      }
    })

  } catch (error) {
    console.error('[debug][curator] Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
