import { requireAdmin } from '@/lib/admin/requireAdmin'
import { parsePaginationParams } from '@/lib/admin/pagination'
import { prisma } from '@/lib/prisma'
import AdminPageShell from '@/components/admin/AdminPageShell'
import CuratorsTable from '@/components/admin/curators/CuratorsTable'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface CuratorsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CuratorsPage({ searchParams }: CuratorsPageProps) {
  await requireAdmin()
  
  const params = await searchParams
  const searchParamsObj = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParamsObj.set(key, Array.isArray(value) ? value[0] : value)
    }
  })
  
  const pagination = parsePaginationParams({ searchParams: searchParamsObj })
  
  // Build where clause
  const where: any = {
    role: 'CURATOR',
  }
  
  if (pagination.search) {
    where.OR = [
      { email: { contains: pagination.search, mode: 'insensitive' as const } },
      { fullName: { contains: pagination.search, mode: 'insensitive' as const } },
      { curatorProfile: { storeName: { contains: pagination.search, mode: 'insensitive' as const } } },
    ]
  }
  
  // Fetch curators and total count in parallel
  const [curators, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        curatorProfile: {
          select: {
            id: true,
            storeName: true,
            slug: true,
            isPublic: true,
            isEditorsPick: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])
  
  const totalPages = Math.ceil(totalCount / pagination.pageSize)
  
  return (
    <AdminPageShell
      title="Curators"
      subtitle="Manage curator profiles, visibility, and editor's picks"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <CuratorsTable
          curators={curators}
          currentPage={pagination.page}
          totalPages={totalPages}
          totalCount={totalCount}
          searchParams={params}
        />
      </Suspense>
    </AdminPageShell>
  )
}
