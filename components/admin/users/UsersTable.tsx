'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'

interface User {
  id: string
  email: string
  fullName: string | null
  role: string
  provider: string | null
  emailVerified: Date | null
  createdAt: Date
  curatorProfile: {
    id: string
    storeName: string
    slug: string
  } | null
}

interface UsersTableProps {
  users: User[]
  currentPage: number
  totalPages: number
  totalCount: number
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function UsersTable({
  users,
  currentPage,
  totalPages,
  totalCount,
  searchParams,
}: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState(
    (searchParams.q as string) || (searchParams.search as string) || ''
  )
  const [roleFilter, setRoleFilter] = useState(
    (searchParams.role as string) || ''
  )
  const [loading, setLoading] = useState(false)

  const handleSearch = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (roleFilter) params.set('role', roleFilter)
    params.set('page', '1')
    window.location.href = `/admin/users?${params.toString()}`
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return
    }

    if (newRole === 'ADMIN' && !confirm('Warning: Granting ADMIN role gives full system access. Continue?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role')
      }

      alert('Role updated successfully')
      window.location.reload()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (roleFilter) params.set('role', roleFilter)
    params.set('page', page.toString())
    return `/admin/users?${params.toString()}`
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'CURATOR':
        return 'bg-green-100 text-green-800'
      case 'BUYER':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="BUYER">Buyer</option>
            <option value="CURATOR">Curator</option>
            <option value="ADMIN">Admin</option>
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
      {users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No users found.</p>
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
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="BUYER">BUYER</option>
                          <option value="CURATOR">CURATOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.provider || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.emailVerified ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/users/${user.id}`}
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
              {Math.min(currentPage * 20, totalCount)} of {totalCount} users
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
