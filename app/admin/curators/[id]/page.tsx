import { requireAdmin } from '@/lib/admin/requireAdmin'
import { prisma } from '@/lib/prisma'
import AdminPageShell from '@/components/admin/AdminPageShell'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CuratorDetailClient from '@/components/admin/curators/CuratorDetailClient'

export const dynamic = 'force-dynamic'

interface CuratorDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CuratorDetailPage({ params }: CuratorDetailPageProps) {
  await requireAdmin()
  
  const { id } = await params
  
  const curatorProfile = (await prisma.curatorProfile.findUnique({
    where: { id },
    select: {
      id: true,
      storeName: true,
      slug: true,
      bio: true,
      city: true, // Note: Requires Prisma client regeneration after migration
      country: true, // Note: Requires Prisma client regeneration after migration
      styleTags: true, // Note: Requires Prisma client regeneration after migration
      instagramUrl: true, // Note: Requires Prisma client regeneration after migration
      tiktokUrl: true, // Note: Requires Prisma client regeneration after migration
      youtubeUrl: true, // Note: Requires Prisma client regeneration after migration
      websiteUrl: true, // Note: Requires Prisma client regeneration after migration
      isPublic: true,
      isEditorsPick: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      },
      products: {
        select: {
          id: true,
          title: true,
          price: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          products: true,
        },
      },
    } as any, // Temporary: Prisma client needs regeneration after schema migration
  })) as any

  if (!curatorProfile) {
    notFound()
  }

  return (
    <AdminPageShell
      title="Curator Profile"
      subtitle={`Managing ${curatorProfile.storeName}`}
    >
      <CuratorDetailClient
        curatorProfile={curatorProfile}
        productsCount={curatorProfile._count.products}
      />
    </AdminPageShell>
  )
}
