'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  id: string
  type: 'product' | 'curator'
  title: string
  subtitle?: string
  image?: string
  price?: number
  category?: string
  curatorName?: string
  bio?: string
  isEditorsPick?: boolean
  slug?: string
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all'
  
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState(type)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${filterType}&limit=50`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results || [])
        } else {
          setError('Failed to fetch search results')
        }
      } catch (error) {
        console.error('Search error:', error)
        setError('Failed to fetch search results')
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, filterType])

  const filteredResults = results.filter(result => {
    if (filterType === 'all') return true
    return result.type === filterType
  })

  const products = filteredResults.filter(r => r.type === 'product')
  const curators = filteredResults.filter(r => r.type === 'curator')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-24">
        <div className="container-custom">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-carbon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for "{query}"...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-24">
        <div className="container-custom">
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Search Results
          </h1>
          <p className="text-lg text-warm-gray font-light mb-8">
            {results.length > 0 
              ? `Found ${results.length} results for "${query}"`
              : `No results found for "${query}"`
            }
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                defaultValue={query}
                placeholder="Search for styles, curators or products…"
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 focus:outline-none focus:border-carbon rounded-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const newQuery = (e.target as HTMLInputElement).value
                    if (newQuery.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(newQuery)}`
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'all'
                      ? 'bg-carbon text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({results.length})
                </button>
                <button
                  onClick={() => setFilterType('product')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'product'
                      ? 'bg-carbon text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Products ({products.length})
                </button>
                <button
                  onClick={() => setFilterType('curator')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === 'curator'
                      ? 'bg-carbon text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Curators ({curators.length})
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-carbon text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-carbon text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="font-serif text-xl font-light mb-2">No results found</h3>
            <p className="text-gray-600 mb-8">
              Try adjusting your search terms or browse our curated collections
            </p>
            <Link href="/explore" className="btn-primary">
              Explore Curators
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}
          >
            {filteredResults.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={viewMode === 'grid' ? 'group cursor-pointer' : 'flex items-center space-x-6 p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow'}
              >
                <Link href={result.type === 'product' ? `/product/${result.id}` : `/curator/${result.slug ?? result.id}`}>
                  <div className={viewMode === 'grid' ? 'space-y-4' : 'flex items-center space-x-6'}>
                    {/* Image */}
                    <div className={viewMode === 'grid' ? 'relative overflow-hidden bg-gray-100 rounded-lg aspect-square' : 'w-24 h-24 flex-shrink-0'}>
                      {result.image ? (
                        <img
                          src={result.image}
                          alt={result.title}
                          className={viewMode === 'grid' ? 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300' : 'w-full h-full object-cover rounded-lg'}
                        />
                      ) : (
                        <div className={viewMode === 'grid' ? 'w-full h-full flex items-center justify-center bg-gray-100' : 'w-full h-full flex items-center justify-center bg-gray-100 rounded-lg'}>
                          <div className="text-gray-400 text-2xl">
                            {result.type === 'product' ? '🛍️' : '👤'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={viewMode === 'grid' ? 'space-y-2' : 'flex-1'}>
                      <h3 className={`font-medium text-gray-900 ${viewMode === 'grid' ? 'text-lg' : 'text-xl'}`}>
                        {result.title}
                      </h3>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500">{result.subtitle}</p>
                      )}
                      {result.price && (
                        <p className="text-lg font-medium text-carbon">${result.price}</p>
                      )}
                      {result.category && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          {result.category}
                        </span>
                      )}
                      {result.isEditorsPick && (
                        <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded ml-2">
                          Editor's Pick
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
} 