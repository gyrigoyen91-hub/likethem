'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, User, Tag, ShoppingBag, TrendingUp, Star, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'product' | 'curator' | 'tag'
  title: string
  subtitle?: string
  image?: string
  price?: number
  category?: string
  curatorName?: string
  bio?: string
  isEditorsPick?: boolean
}

const trendingSuggestions = [
  { icon: TrendingUp, text: 'Trending curators in Paris', query: 'paris' },
  { icon: Star, text: "Editor's Picks", query: 'editor picks' },
  { icon: DollarSign, text: 'Minimal looks under $200', query: 'minimal under 200' }
]

interface SearchBarProps {
  variant?: 'header' | 'page'
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
}

export default function SearchBar({ 
  variant = 'header', 
  placeholder = "Search for styles, curators or products…",
  className = '',
  onSearch 
}: SearchBarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`)
          if (response.ok) {
            const data = await response.json()
            setResults(data.results || [])
          } else {
            setResults([])
          }
        } catch (error) {
          console.error('Search error:', error)
          setResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, -1))
          break
        case 'Enter':
          e.preventDefault()
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultClick(results[selectedIndex])
          } else if (query.trim()) {
            handleSearch()
          }
          break
        case 'Escape':
          setIsOpen(false)
          setQuery('')
          setResults([])
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex, query])

  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query.trim())
      setIsOpen(false)
      setQuery('')
      setResults([])
    }
  }

  const handleResultClick = (result: SearchResult) => {
    // Navigate based on result type
    switch (result.type) {
      case 'product':
        router.push(`/product/${result.id}`)
        break
      case 'curator':
        router.push(`/curator/${result.id}`)
        break
      case 'tag':
        // Navigate to search results page with tag filter
        router.push(`/search?q=${encodeURIComponent(result.title)}&type=tag`)
        break
    }
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  const handleSuggestionClick = (suggestion: typeof trendingSuggestions[0]) => {
    setQuery(suggestion.query)
    onSearch?.(suggestion.query)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product':
        return ShoppingBag
      case 'curator':
        return User
      case 'tag':
        return Tag
      default:
        return ShoppingBag
    }
  }

  if (variant === 'header') {
    return (
      <>
        {/* Search Icon */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-10 h-10 text-carbon hover:text-black transition-colors duration-200"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Full-screen Search Modal */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Search Input */}
                <div className="flex items-center p-4 border-b border-gray-200">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 text-lg font-medium focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="ml-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Results */}
                <div ref={resultsRef} className="max-h-96 overflow-y-auto">
                  {query.length < 2 && (
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-3">Trending Searches</h3>
                      <div className="space-y-2">
                        {trendingSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="flex items-center space-x-3 w-full p-2 hover:bg-gray-50 rounded text-left"
                          >
                            <suggestion.icon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{suggestion.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {isLoading && (
                    <div className="p-4 text-center text-gray-500">
                      Searching...
                    </div>
                  )}

                  {results.length > 0 && (
                    <div className="p-4">
                      {results.map((result, index) => {
                        const Icon = getResultIcon(result.type)
                        const isSelected = index === selectedIndex
                        
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={`flex items-center space-x-3 w-full p-3 hover:bg-gray-50 rounded text-left ${
                              isSelected ? 'bg-gray-50' : ''
                            }`}
                          >
                            {result.image ? (
                              <img
                                src={result.image}
                                alt={result.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <Icon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{result.title}</div>
                              {result.subtitle && (
                                <div className="text-sm text-gray-500">{result.subtitle}</div>
                              )}
                              {result.price && (
                                <div className="text-sm font-medium text-carbon">${result.price}</div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {query.length >= 2 && results.length === 0 && !isLoading && (
                    <div className="p-4 text-center text-gray-500">
                      No matches found. Try a different keyword.
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Page variant
  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 focus:outline-none focus:border-carbon rounded-lg"
        />
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto"
          >
            {results.map((result, index) => {
              const Icon = getResultIcon(result.type)
              const isSelected = index === selectedIndex
              
              return (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`flex items-center space-x-3 w-full p-4 hover:bg-gray-50 text-left ${
                    isSelected ? 'bg-gray-50' : ''
                  }`}
                >
                  {result.image ? (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{result.title}</div>
                    {result.subtitle && (
                      <div className="text-sm text-gray-500">{result.subtitle}</div>
                    )}
                    {result.price && (
                      <div className="text-sm font-medium text-carbon">${result.price}</div>
                    )}
                  </div>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 