import { notFound } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { CuratorSEO } from '@/components/SEO'
import { CuratorImage } from '@/components/OptimizedImage'
import CuratorDetailClient from '@/components/CuratorDetailClient'

// Force Vercel cache invalidation - trivial change
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
  // This converts all string | null values from Prisma to string | undefined for TypeScript compatibility
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
      fullName: curator.user.fullName ?? undefined,
      avatar: curator.user.avatar ?? undefined,
    },
    products: curator.products.map(product => ({
      ...product,
      curatorNote: product.curatorNote ?? undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      images: product.images.map(image => ({
        ...image,
        altText: image.altText ?? undefined,
      })),
    })),
  }

  const description = curator.bio || `Discover unique fashion curated by ${curator.storeName}`
  const imageUrl = curator.bannerImage || ''

  // Runtime check to verify transformedCurator is being used
  console.log("✅ USING transformedCurator", transformedCurator);
  
  // Detailed runtime inspection to confirm null to undefined conversion
  console.log("✅ Final transformedCurator object", JSON.stringify(transformedCurator, null, 2));
  
  // CRITICAL: Confirm we're using transformedCurator, not raw curator
  console.log("USING transformedCurator ✅", transformedCurator);
  
  // FORCE VERCEL DEPLOYMENT - This ensures the latest code is deployed

  return (
    <>
      <CuratorSEO
        name={curator.storeName}
        description={description}
        image={imageUrl || undefined}
        slug={curator.slug}
      />
      
      {/* IMPORTANT: Use transformedCurator (not raw curator) to ensure TypeScript compatibility */}
      {/* This converts string | null to string | undefined for all optional fields */}
      {/* Raw curator object from Prisma has string | null fields, but component expects string | undefined */}
      {/* CRITICAL: Only transformedCurator should be passed, never the raw curator object */}
      {/* URGENT FIX: This line MUST use transformedCurator, not curator */}
      {/* CRITICAL: Never pass raw curator object - only use transformedCurator */}
      {/* VERCEL FIX: This line MUST use transformedCurator, NOT curator */}
      <CuratorDetailClient curator={transformedCurator} />
    </>
  )
} 