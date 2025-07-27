import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { ProductSEO } from '@/components/SEO'
import { ProductImage } from '@/components/OptimizedImage'
import ProductDetailClient from '@/components/ProductDetailClient'

const prisma = new PrismaClient()

interface ProductPageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true }
  })

  return products.map((product) => ({
    slug: product.slug,
  }))
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      curator: {
        select: {
          storeName: true
        }
      },
      images: {
        orderBy: { order: 'asc' },
        take: 1
      }
    }
  })

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    }
  }

  const description = product.curatorNote || product.description
  const imageUrl = product.images[0]?.url || ''
  const tags = product.tags ? product.tags.split(',').map(tag => tag.trim()) : []

  return {
    title: product.title,
    description: description.substring(0, 160),
    openGraph: {
      title: product.title,
      description: description.substring(0, 160),
      images: [imageUrl],
      type: 'website',
      url: `/product/${product.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: description.substring(0, 160),
      images: [imageUrl]
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      curator: {
        select: {
          id: true,
          storeName: true,
          bio: true,
          slug: true,
          user: {
            select: {
              fullName: true
            }
          }
        }
      },
      images: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!product || !product.isActive) {
    notFound()
  }

  // Transform the product data to match the expected Product interface
  const transformedProduct = {
    ...product,
    curatorNote: product.curatorNote ?? undefined,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    curator: {
      ...product.curator,
      bio: product.curator.bio ?? undefined,
      user: {
        ...product.curator.user,
        fullName: product.curator.user.fullName ?? undefined,
      }
    },
    images: product.images.map(image => ({
      ...image,
      altText: image.altText ?? undefined,
    }))
  }

  const description = product.curatorNote || product.description
  const imageUrl = product.images[0]?.url || ''
  const tags = product.tags ? product.tags.split(',').map(tag => tag.trim()) : []

  return (
    <>
      <ProductSEO
        title={product.title}
        description={description}
        price={product.price}
        image={imageUrl}
        slug={product.slug}
        curator={product.curator.storeName}
        category={product.category}
        tags={tags}
      />
      
      <ProductDetailClient product={transformedProduct} />
    </>
  )
} 