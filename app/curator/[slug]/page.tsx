import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { CuratorSEO } from '@/components/SEO'
import { CuratorImage } from '@/components/OptimizedImage'
import CuratorDetailClient from '@/components/CuratorDetailClient'

const prisma = new PrismaClient()

interface CuratorPageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  const curators = await prisma.curatorProfile.findMany({
    where: { isPublic: true },
    select: { slug: true }
  })

  return curators.map((curator) => ({
    slug: curator.slug,
  }))
}

export async function generateMetadata({ params }: CuratorPageProps) {
  const curator = await prisma.curatorProfile.findUnique({
    where: { slug: params.slug },
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
}

export default async function CuratorPage({ params }: CuratorPageProps) {
  const curator = await prisma.curatorProfile.findUnique({
    where: { slug: params.slug },
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
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!curator || !curator.isPublic) {
    notFound()
  }

  // Transform the data to match the expected Curator interface
  const transformedCurator = {
    id: curator.id,
    storeName: curator.storeName,
    bio: curator.bio || undefined,
    bannerImage: curator.bannerImage || undefined,
    instagram: curator.instagram || undefined,
    tiktok: curator.tiktok || undefined,
    youtube: curator.youtube || undefined,
    twitter: curator.twitter || undefined,
    isEditorsPick: curator.isEditorsPick,
    slug: curator.slug,
    user: {
      id: curator.user.id,
      fullName: curator.user.fullName || undefined,
      avatar: curator.user.avatar || undefined
    },
    products: curator.products.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category,
      tags: product.tags,
      sizes: product.sizes,
      colors: product.colors,
      stockQuantity: product.stockQuantity,
      curatorNote: product.curatorNote || undefined,
      slug: product.slug,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      images: product.images.map(image => ({
        id: image.id,
        url: image.url,
        altText: image.altText || undefined,
        order: image.order
      }))
    }))
  }

  const description = curator.bio || `Discover unique fashion curated by ${curator.storeName}`
  const imageUrl = curator.bannerImage || ''

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
} 