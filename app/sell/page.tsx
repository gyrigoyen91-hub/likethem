'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Upload, Instagram, Music2, Store } from 'lucide-react'
import { createSlug } from '@/lib/slug'

interface CuratorForm {
  storeName: string
  bio: string
  instagram: string
  tiktok: string
  bannerImage: File | null
}

export default function BecomeCurator() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [form, setForm] = useState<CuratorForm>({
    storeName: '',
    bio: '',
    instagram: '',
    tiktok: '',
    bannerImage: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewSlug, setPreviewSlug] = useState('')

  // Check authentication
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin?redirect=/sell')
      return
    }

    // Check if user already has a curator profile
    const checkExistingProfile = async () => {
      try {
        const response = await fetch('/api/curator/profile', {
          credentials: 'include'
        })
        
        if (response.ok) {
          // User already has a curator profile, redirect to dashboard
          router.push('/dashboard/curator')
        }
      } catch (error) {
        console.error('Error checking curator profile:', error)
      }
    }

    checkExistingProfile()
  }, [session, status, router])

  // Generate preview slug when store name changes
  useEffect(() => {
    if (form.storeName) {
      const slug = createSlug(form.storeName)
      setPreviewSlug(slug)
    } else {
      setPreviewSlug('')
    }
  }, [form.storeName])

  const handleInputChange = (field: keyof CuratorForm, value: string | File | null) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB')
        return
      }
      handleInputChange('bannerImage', file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.storeName.trim()) {
      setError('Store name is required')
      return
    }

    if (!form.bio.trim()) {
      setError('Bio is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Upload banner image if provided
      let bannerImageUrl = null
      if (form.bannerImage) {
        const formData = new FormData()
        formData.append('file', form.bannerImage)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload banner image')
        }

        const uploadData = await uploadResponse.json()
        bannerImageUrl = uploadData.urls[0]
      }

      // Create curator profile
      const response = await fetch('/api/curator/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          storeName: form.storeName.trim(),
          bio: form.bio.trim(),
          instagram: form.instagram.trim() || null,
          tiktok: form.tiktok.trim() || null,
          bannerImage: bannerImageUrl
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create store')
      }

      // Success! Redirect to curator dashboard
      router.push('/dashboard/curator')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Open Your Storefront
            </h1>
            <p className="text-gray-600 text-lg">
              Create your own store and start curating products.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Name */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                id="storeName"
                value={form.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="e.g., Young Money Style"
                required
              />
              {previewSlug && (
                <p className="mt-2 text-sm text-gray-500">
                  Your store will be available at: <span className="font-mono text-black">/curator/{previewSlug}</span>
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                id="bio"
                value={form.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Tell customers about your style and what you curate..."
                required
              />
            </div>

            {/* Social Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                  <Instagram className="inline w-4 h-4 mr-1" />
                  Instagram (optional)
                </label>
                <input
                  type="text"
                  id="instagram"
                  value={form.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="@yourhandle"
                />
              </div>
              <div>
                <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-2">
                  <Music2 className="inline w-4 h-4 mr-1" />
                  TikTok (optional)
                </label>
                <input
                  type="text"
                  id="tiktok"
                  value={form.tiktok}
                  onChange={(e) => handleInputChange('tiktok', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="@yourhandle"
                />
              </div>
            </div>

            {/* Banner Image */}
            <div>
              <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image (optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="bannerImage"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-black"
                    >
                      <span>Upload a file</span>
                      <input
                        id="bannerImage"
                        name="bannerImage"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              {form.bannerImage && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {form.bannerImage.name}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Store...' : 'Create Store'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              By creating a store, you agree to our{' '}
              <a href="#" className="text-black hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-black hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 