import { requireAdmin } from '@/lib/admin/requireAdmin'
import { parsePaginationParams } from '@/lib/admin/pagination'
import { prisma } from '@/lib/prisma'
import AdminPageShell from '@/components/admin/AdminPageShell'
import UsersTable from '@/components/admin/users/UsersTable'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface UsersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
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
  const where: any = {}
  
  if (pagination.search) {
    where.OR = [
      { email: { contains: pagination.search, mode: 'insensitive' as const } },
      { fullName: { contains: pagination.search, mode: 'insensitive' as const } },
    ]
  }
  
  if (pagination.filters.role) {
    where.role = pagination.filters.role
  }
  
  // Fetch users and total count in parallel
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        provider: true,
        emailVerified: true,
        createdAt: true,
        curatorProfile: {
          select: {
            id: true,
            storeName: true,
            slug: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ])
  
  const totalPages = Math.ceil(totalCount / pagination.pageSize)
  
  return (
    <AdminPageShell
      title="Manage Users"
      subtitle="View and manage user accounts, permissions, and roles"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <UsersTable
          users={users}
          currentPage={pagination.page}
          totalPages={totalPages}
          totalCount={totalCount}
          searchParams={params}
        />
      </Suspense>
    </AdminPageShell>
  )
}
