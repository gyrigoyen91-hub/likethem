import { requireAdmin } from '@/lib/admin/requireAdmin'
import { parsePaginationParams } from '@/lib/admin/pagination'
import { prisma } from '@/lib/prisma'
import AdminPageShell from '@/components/admin/AdminPageShell'
import ProductsTable from '@/components/admin/products/ProductsTable'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
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
    where.title = { contains: pagination.search, mode: 'insensitive' as const }
  }
  
  if (pagination.filters.status) {
    if (pagination.filters.status === 'ACTIVE') {
      where.isActive = true
    } else if (pagination.filters.status === 'INACTIVE') {
      where.isActive = false
    }
  }
  
  if (pagination.filters.curator) {
    where.curatorId = pagination.filters.curator
  }
  
  // Fetch products and total count in parallel
  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
      include: {
        curator: {
          select: {
            id: true,
            storeName: true,
            slug: true,
            user: {
              select: {
                email: true,
                fullName: true,
              },
            },
          },
        },
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ])
  
  const totalPages = Math.ceil(totalCount / pagination.pageSize)
  
  return (
    <AdminPageShell
      title="Product Oversight"
      subtitle="Monitor product listings, quality, and compliance"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsTable
          products={products}
          currentPage={pagination.page}
          totalPages={totalPages}
          totalCount={totalCount}
          searchParams={params}
        />
      </Suspense>
    </AdminPageShell>
  )
}
