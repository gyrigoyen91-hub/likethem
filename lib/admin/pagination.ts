import { NextRequest } from 'next/server'

export interface PaginationParams {
  page: number
  pageSize: number
  skip: number
  take: number
  search?: string
  filters: Record<string, string | undefined>
}

/**
 * Parse pagination and filter params from Next.js request or searchParams
 */
export function parsePaginationParams(
  requestOrParams: NextRequest | { searchParams: URLSearchParams }
): PaginationParams {
  const searchParams = 
    'searchParams' in requestOrParams
      ? requestOrParams.searchParams
      : requestOrParams.nextUrl.searchParams

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)))
  const search = searchParams.get('q') || searchParams.get('search') || undefined
  const skip = (page - 1) * pageSize
  const take = pageSize

  // Extract all filter params (exclude pagination/search params)
  const filters: Record<string, string | undefined> = {}
  const excludeKeys = ['page', 'pageSize', 'q', 'search']
  searchParams.forEach((value, key) => {
    if (!excludeKeys.includes(key)) {
      filters[key] = value || undefined
    }
  })

  return {
    page,
    pageSize,
    skip,
    take,
    search,
    filters,
  }
}
