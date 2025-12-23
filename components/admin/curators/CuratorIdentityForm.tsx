'use client'

import { useState, useEffect } from 'react'
import { useT } from '@/hooks/useT'
import { CheckCircle2, XCircle } from 'lucide-react'

const ALLOWED_STYLE_TAGS = [
  { value: 'streetwear', key: 'explore.filter.tags.streetwear' },
  { value: 'vintage', key: 'explore.filter.tags.vintage' },
  { value: 'minimal', key: 'explore.filter.tags.minimal' },
  { value: 'luxury', key: 'explore.filter.tags.luxury' },
  { value: 'casual', key: 'explore.filter.tags.casual' },
  { value: 'formal', key: 'explore.filter.tags.formal' },
  { value: 'sporty', key: 'explore.filter.tags.sporty' },
  { value: 'bohemian', key: 'explore.filter.tags.bohemian' },
] as const

interface CuratorIdentityFormProps {
  curatorId: string
  initialData: {
    bio?: string | null
    city?: string | null
    country?: string | null
    styleTags?: string[] | null
    instagramUrl?: string | null
    tiktokUrl?: string | null
    youtubeUrl?: string | null
    websiteUrl?: string | null
  }
}

export default function CuratorIdentityForm({
  curatorId,
  initialData,
}: CuratorIdentityFormProps) {
  const t = useT()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [bio, setBio] = useState(initialData.bio || '')
  const [city, setCity] = useState(initialData.city || '')
  const [country, setCountry] = useState(initialData.country || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData.styleTags || [])
  const [instagramUrl, setInstagramUrl] = useState(initialData.instagramUrl || '')
  const [tiktokUrl, setTiktokUrl] = useState(initialData.tiktokUrl || '')
  const [youtubeUrl, setYoutubeUrl] = useState(initialData.youtubeUrl || '')
  const [websiteUrl, setWebsiteUrl] = useState(initialData.websiteUrl || '')

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true // Empty is valid
    return url.startsWith('https://') || url.startsWith('http://')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Validate URLs
    const urlErrors: string[] = []
    if (instagramUrl && !validateUrl(instagramUrl)) {
      urlErrors.push(t('admin.curator.identity.urlError.instagram'))
    }
    if (tiktokUrl && !validateUrl(tiktokUrl)) {
      urlErrors.push(t('admin.curator.identity.urlError.tiktok'))
    }
    if (youtubeUrl && !validateUrl(youtubeUrl)) {
      urlErrors.push(t('admin.curator.identity.urlError.youtube'))
    }
    if (websiteUrl && !validateUrl(websiteUrl)) {
      urlErrors.push(t('admin.curator.identity.urlError.website'))
    }

    if (urlErrors.length > 0) {
      setError(urlErrors.join(', '))
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/curators/${curatorId}/identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bio: bio.trim() || null,
          city: city.trim() || null,
          country: country.trim() || null,
          styleTags: selectedTags.length > 0 ? selectedTags : null,
          instagramUrl: instagramUrl.trim() || null,
          tiktokUrl: tiktokUrl.trim() || null,
          youtubeUrl: youtubeUrl.trim() || null,
          websiteUrl: websiteUrl.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t('admin.curator.identity.saveError'))
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || t('admin.curator.identity.saveError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.curator.identity.bio')} <span className="text-gray-400">({t('admin.curator.identity.maxChars', { max: 280 })})</span>
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => {
            if (e.target.value.length <= 280) {
              setBio(e.target.value)
            }
          }}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
          placeholder={t('admin.curator.identity.bioPlaceholder')}
        />
        <p className="mt-1 text-xs text-gray-500">
          {bio.length}/280 {t('admin.curator.identity.characters')}
        </p>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.curator.identity.city')}
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder={t('admin.curator.identity.cityPlaceholder')}
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            {t('admin.curator.identity.country')}
          </label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder={t('admin.curator.identity.countryPlaceholder')}
          />
        </div>
      </div>

      {/* Style Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.curator.identity.styleTags')}
        </label>
        <div className="flex flex-wrap gap-2">
          {ALLOWED_STYLE_TAGS.map(tag => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedTags.includes(tag.value)
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {t(tag.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">{t('admin.curator.identity.socialLinks')}</h4>
        
        <div>
          <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Instagram URL
          </label>
          <input
            id="instagramUrl"
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="https://instagram.com/username"
          />
        </div>

        <div>
          <label htmlFor="tiktokUrl" className="block text-sm font-medium text-gray-700 mb-2">
            TikTok URL
          </label>
          <input
            id="tiktokUrl"
            type="url"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="https://tiktok.com/@username"
          />
        </div>

        <div>
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL
          </label>
          <input
            id="youtubeUrl"
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="https://youtube.com/@channel"
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            id="websiteUrl"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t('admin.curator.identity.saveSuccess')}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  )
}
