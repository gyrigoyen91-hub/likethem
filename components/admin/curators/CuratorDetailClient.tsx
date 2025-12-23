'use client'

import { useState } from 'react'
import Link from 'next/link'
import CuratorIdentityForm from './CuratorIdentityForm'

interface CuratorDetailClientProps {
  curatorProfile: {
    id: string
    storeName: string
    slug: string
    bio: string | null
    city?: string | null
    country?: string | null
    styleTags?: string | null
    instagramUrl?: string | null
    tiktokUrl?: string | null
    youtubeUrl?: string | null
    websiteUrl?: string | null
    isPublic: boolean
    isEditorsPick: boolean
    createdAt: Date
    user: {
      id: string
      email: string
      fullName: string | null
      role: string
      createdAt: Date
    }
    products: Array<{
      id: string
      title: string
      price: number
      isActive: boolean
      createdAt: Date
    }>
  }
  productsCount: number
}

export default function CuratorDetailClient({
  curatorProfile,
  productsCount,
}: CuratorDetailClientProps) {
  const [isPublic, setIsPublic] = useState(curatorProfile.isPublic)
  const [isEditorsPick, setIsEditorsPick] = useState(curatorProfile.isEditorsPick)

  const handleToggle = async (field: 'isPublic' | 'isEditorsPick', value: boolean) => {
    const endpoint =
      field === 'isPublic'
        ? `/api/admin/curators/${curatorProfile.id}/visibility`
        : `/api/admin/curators/${curatorProfile.id}/editors-pick`

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [field]: value }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update')
      }

      if (field === 'isPublic') {
        setIsPublic(value)
      } else {
        setIsEditorsPick(value)
      }

      alert(`${field === 'isPublic' ? 'Visibility' : "Editor's Pick"} updated successfully`)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Store Name</h4>
            <p className="text-gray-900">{curatorProfile.storeName}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Slug</h4>
            <p className="text-gray-900 font-mono text-sm">{curatorProfile.slug}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">User Email</h4>
            <p className="text-gray-900">{curatorProfile.user.email}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">User Name</h4>
            <p className="text-gray-900">{curatorProfile.user.fullName || '—'}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Created At</h4>
            <p className="text-gray-900">
              {new Date(curatorProfile.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Total Products</h4>
            <p className="text-gray-900">{productsCount}</p>
          </div>
        </div>

        {curatorProfile.bio && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Bio</h4>
            <p className="text-gray-900 whitespace-pre-wrap">{curatorProfile.bio}</p>
          </div>
        )}
      </div>

      {/* Curator Identity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Curator Identity</h3>
        <CuratorIdentityForm
          curatorId={curatorProfile.id}
          initialData={{
            bio: curatorProfile.bio,
            city: curatorProfile.city,
            country: curatorProfile.country,
            styleTags: curatorProfile.styleTags ? JSON.parse(curatorProfile.styleTags) : null,
            instagramUrl: curatorProfile.instagramUrl,
            tiktokUrl: curatorProfile.tiktokUrl,
            youtubeUrl: curatorProfile.youtubeUrl,
            websiteUrl: curatorProfile.websiteUrl,
          }}
        />
      </div>

      {/* Toggles */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Public Visibility</h4>
              <p className="text-sm text-gray-500">
                Whether this curator profile is visible to the public
              </p>
            </div>
            <button
              onClick={() => handleToggle('isPublic', !isPublic)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isPublic
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {isPublic ? 'Public' : 'Hidden'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Editor's Pick</h4>
              <p className="text-sm text-gray-500">
                Feature this curator as an editor's pick
              </p>
            </div>
            <button
              onClick={() => handleToggle('isEditorsPick', !isEditorsPick)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isEditorsPick
                  ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {isEditorsPick ? 'Featured' : 'Not Featured'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      {curatorProfile.products.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Products</h3>
            <Link
              href={`/admin/products?curator=${curatorProfile.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {curatorProfile.products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{product.title}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link
          href="/admin/curators"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Curators
        </Link>
        <Link
          href={`/admin/users/${curatorProfile.user.id}`}
          className="text-blue-600 hover:text-blue-700"
        >
          View User Profile →
        </Link>
      </div>
    </div>
  )
}
