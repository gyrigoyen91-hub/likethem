'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useT } from '@/hooks/useT'
import { Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type SortOption = 'editors-pick' | 'popular' | 'newest' | 'alphabetical'
type PriceRange = 'under-100' | '100-300' | '300-plus'

const STYLE_TAGS = [
  { value: 'streetwear', key: 'explore.filter.tags.streetwear' },
  { value: 'vintage', key: 'explore.filter.tags.vintage' },
  { value: 'minimal', key: 'explore.filter.tags.minimal' },
  { value: 'luxury', key: 'explore.filter.tags.luxury' },
  { value: 'casual', key: 'explore.filter.tags.casual' },
  { value: 'formal', key: 'explore.filter.tags.formal' },
  { value: 'sporty', key: 'explore.filter.tags.sporty' },
  { value: 'bohemian', key: 'explore.filter.tags.bohemian' },
] as const

export default function Filters() {
  const t = useT()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [priceRange, setPriceRange] = useState<PriceRange | ''>('')
  const [sort, setSort] = useState<SortOption>('editors-pick')

  // Initialize from URL params
  useEffect(() => {
    const styleParam = searchParams.get('style')
    if (styleParam) {
      setSelectedStyles(styleParam.split(',').filter(Boolean))
    }
    setCity(searchParams.get('city') || '')
    setCountry(searchParams.get('country') || '')
    setPriceRange((searchParams.get('priceRange') as PriceRange) || '')
    setSort((searchParams.get('sort') as SortOption) || 'editors-pick')
  }, [searchParams])

  const hasActiveFilters = selectedStyles.length > 0 || city || country || priceRange || sort !== 'editors-pick'

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Remove existing filter params
    params.delete('style')
    params.delete('city')
    params.delete('country')
    params.delete('priceRange')
    params.delete('sort')
    params.delete('cursor') // Reset pagination when filters change

    // Add new filter params
    if (selectedStyles.length > 0) {
      params.set('style', selectedStyles.join(','))
    }
    if (city) {
      params.set('city', city)
    }
    if (country) {
      params.set('country', country)
    }
    if (priceRange) {
      params.set('priceRange', priceRange)
    }
    if (sort !== 'editors-pick') {
      params.set('sort', sort)
    }

    router.push(`/explore?${params.toString()}`)
    setIsOpen(false)
  }

  const resetFilters = () => {
    setSelectedStyles([])
    setCity('')
    setCountry('')
    setPriceRange('')
    setSort('editors-pick')
    
    const params = new URLSearchParams(searchParams.toString())
    params.delete('style')
    params.delete('city')
    params.delete('country')
    params.delete('priceRange')
    params.delete('sort')
    params.delete('cursor')
    
    router.push(`/explore?${params.toString()}`)
  }

  const toggleStyle = (tag: string) => {
    setSelectedStyles(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className="mb-6">
      {/* Desktop: Sticky filter bar */}
      <div className="hidden md:block sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200 -mx-4 md:-mx-6 px-4 md:px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-zinc-700 whitespace-nowrap">
              {t('explore.sortBy')}:
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortOption)
                applyFilters()
              }}
              className="text-sm border border-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="editors-pick">{t('explore.sort.editorsPick')}</option>
              <option value="popular">{t('explore.sort.popular')}</option>
              <option value="newest">{t('explore.sort.newest')}</option>
              <option value="alphabetical">{t('explore.sort.alphabetical')}</option>
            </select>
          </div>

          {/* Style Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-zinc-700 whitespace-nowrap">
              {t('explore.filter.style')}:
            </span>
            {STYLE_TAGS.map(tag => (
              <button
                key={tag.value}
                onClick={() => {
                  toggleStyle(tag.value)
                  // Auto-apply on click for desktop
                  setTimeout(() => {
                    const newStyles = selectedStyles.includes(tag.value)
                      ? selectedStyles.filter(t => t !== tag.value)
                      : [...selectedStyles, tag.value]
                    setSelectedStyles(newStyles)
                    const params = new URLSearchParams(searchParams.toString())
                    if (newStyles.length > 0) {
                      params.set('style', newStyles.join(','))
                    } else {
                      params.delete('style')
                    }
                    params.delete('cursor')
                    router.push(`/explore?${params.toString()}`)
                  }, 0)
                }}
                className={cn(
                  'text-xs px-3 py-1 rounded-full border transition-colors',
                  selectedStyles.includes(tag.value)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                )}
              >
                {t(tag.key)}
              </button>
            ))}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={t('explore.filter.city')}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  applyFilters()
                }
              }}
              onBlur={applyFilters}
              className="text-sm border border-zinc-200 rounded-lg px-3 py-1.5 w-32 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <select
              value={priceRange}
              onChange={(e) => {
                setPriceRange(e.target.value as PriceRange | '')
                applyFilters()
              }}
              className="text-sm border border-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="">{t('explore.filter.priceRange')}</option>
              <option value="under-100">{t('explore.filter.priceRange.under100')}</option>
              <option value="100-300">{t('explore.filter.priceRange.100to300')}</option>
              <option value="300-plus">{t('explore.filter.priceRange.300plus')}</option>
            </select>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-zinc-600 hover:text-zinc-900 underline ml-auto"
            >
              {t('explore.filter.reset')}
            </button>
          )}
        </div>
      </div>

      {/* Mobile: Collapsible filter drawer */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-600" />
            <span className="text-sm font-medium text-zinc-900">
              {t('explore.filters')}
            </span>
            {hasActiveFilters && (
              <span className="text-xs bg-black text-white rounded-full px-2 py-0.5">
                {[
                  selectedStyles.length,
                  city ? 1 : 0,
                  country ? 1 : 0,
                  priceRange ? 1 : 0,
                  sort !== 'editors-pick' ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-zinc-600" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-600" />
          )}
        </button>

        {isOpen && (
          <div className="mt-3 p-4 bg-white border border-zinc-200 rounded-xl space-y-4">
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {t('explore.sortBy')}
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="editors-pick">{t('explore.sort.editorsPick')}</option>
                <option value="popular">{t('explore.sort.popular')}</option>
                <option value="newest">{t('explore.sort.newest')}</option>
                <option value="alphabetical">{t('explore.sort.alphabetical')}</option>
              </select>
            </div>

            {/* Style Tags */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {t('explore.filter.style')}
              </label>
              <div className="flex flex-wrap gap-2">
                {STYLE_TAGS.map(tag => (
                  <button
                    key={tag.value}
                    onClick={() => toggleStyle(tag.value)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border transition-colors',
                      selectedStyles.includes(tag.value)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-zinc-700 border-zinc-200'
                    )}
                  >
                    {t(tag.key)}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {t('explore.filter.location')}
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder={t('explore.filter.city')}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                />
                <input
                  type="text"
                  placeholder={t('explore.filter.country')}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                {t('explore.filter.priceRange')}
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as PriceRange | '')}
                className="w-full text-sm border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="">{t('explore.filter.priceRange')}</option>
                <option value="under-100">{t('explore.filter.priceRange.under100')}</option>
                <option value="100-300">{t('explore.filter.priceRange.100to300')}</option>
                <option value="300-plus">{t('explore.filter.priceRange.300plus')}</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-black text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                {t('explore.filter.apply')}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-zinc-600 hover:text-zinc-900 underline px-4"
                >
                  {t('explore.filter.reset')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
