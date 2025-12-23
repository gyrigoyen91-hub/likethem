'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  title: string
  price: number
  isActive: boolean
  createdAt: Date
  curator: {
    id: string
    storeName: string
    slug: string
    user: {
      email: string
      fullName: string | null
    }
  }
  images: Array<{ url: string }>
  _count: {
    orderItems: number
  }
}

interface ProductsTableProps {
  products: Product[]
  currentPage: number
  totalPages: number
  totalCount: number
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ProductsTable({
  products,
  currentPage,
  totalPages,
  totalCount,
  searchParams,
}: ProductsTableProps) {
  const [searchQuery, setSearchQuery] = useState(
    (searchParams.q as string) || (searchParams.search as string) || ''
  )
  const [statusFilter, setStatusFilter] = useState(
    (searchParams.status as string) || ''
  )
  const [loading, setLoading] = useState(false)

  const handleSearch = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (statusFilter) params.set('status', statusFilter)
    params.set('page', '1')
    window.location.href = `/admin/products?${params.toString()}`
  }

  const handleStatusChange = async (productId: string, newStatus: boolean) => {
    const status = newStatus ? 'ACTIVE' : 'HIDDEN'
    
    try {
      const response = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status')
      }

      alert('Product status updated successfully')
      window.location.reload()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (statusFilter) params.set('status', statusFilter)
    params.set('page', page.toString())
    return `/admin/products?${params.toString()}`
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Table */}
      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No products found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.images[0] && (
                          <div className="w-12 h-12 relative rounded overflow-hidden">
                            <Image
                              src={product.images[0].url}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.curator.storeName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.curator.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={product.isActive ? 'ACTIVE' : 'INACTIVE'}
                        onChange={(e) =>
                          handleStatusChange(product.id, e.target.value === 'ACTIVE')
                        }
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product._count.orderItems}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * 20 + 1} to{' '}
              {Math.min(currentPage * 20, totalCount)} of {totalCount} products
            </div>
            <div className="flex gap-2">
              <Link
                href={buildPageUrl(currentPage - 1)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={buildPageUrl(currentPage + 1)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage >= totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
