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
      
      <CuratorDetailClient curator={curator} />
    </>
  )
} 