'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'

interface Curator {
  id: string
  email: string
  fullName: string | null
  createdAt: Date
  curatorProfile: {
    id: string
    storeName: string
    slug: string
    isPublic: boolean
    isEditorsPick: boolean
    createdAt: Date
  } | null
}

interface CuratorsTableProps {
  curators: Curator[]
  currentPage: number
  totalPages: number
  totalCount: number
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function CuratorsTable({
  curators,
  currentPage,
  totalPages,
  totalCount,
  searchParams,
}: CuratorsTableProps) {
  const [searchQuery, setSearchQuery] = useState(
    (searchParams.q as string) || (searchParams.search as string) || ''
  )
  const [loading, setLoading] = useState(false)

  const handleSearch = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    params.set('page', '1')
    window.location.href = `/admin/curators?${params.toString()}`
  }

  const handleToggle = async (
    curatorProfileId: string,
    field: 'isPublic' | 'isEditorsPick',
    currentValue: boolean
  ) => {
    try {
      const endpoint =
        field === 'isPublic'
          ? `/api/admin/curators/${curatorProfileId}/visibility`
          : `/api/admin/curators/${curatorProfileId}/editors-pick`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: !currentValue }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update')
      }

      alert(`${field === 'isPublic' ? 'Visibility' : "Editor's Pick"} updated successfully`)
      window.location.reload()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    params.set('page', page.toString())
    return `/admin/curators?${params.toString()}`
  }

  return (
    <div>
      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or store name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
      {curators.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No curators found.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Public
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Editor's Pick
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {curators.map((curator) => {
                  const profile = curator.curatorProfile
                  return (
                    <tr key={curator.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {curator.fullName || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{curator.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {profile ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {profile.storeName}
                            </div>
                            <div className="text-xs text-gray-500">{profile.slug}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No profile</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {profile ? (
                          <button
                            onClick={() =>
                              handleToggle(profile.id, 'isPublic', profile.isPublic)
                            }
                            className={`px-3 py-1 text-xs rounded-full ${
                              profile.isPublic
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {profile.isPublic ? 'Yes' : 'No'}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {profile ? (
                          <button
                            onClick={() =>
                              handleToggle(profile.id, 'isEditorsPick', profile.isEditorsPick)
                            }
                            className={`px-3 py-1 text-xs rounded-full ${
                              profile.isEditorsPick
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {profile.isEditorsPick ? 'Yes' : 'No'}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {profile ? (
                          <Link
                            href={`/admin/curators/${profile.id}`}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * 20 + 1} to{' '}
              {Math.min(currentPage * 20, totalCount)} of {totalCount} curators
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
