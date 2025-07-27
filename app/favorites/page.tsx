'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2, Eye } from 'lucide-react'
import SearchBar from '@/components/SearchBar'

const favorites = [
  {
    id: 1,
    name: 'Minimalist Cotton Blazer',
    price: 289.00,
    curator: 'Sofia Laurent',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  },
  {
    id: 2,
    name: 'Vintage Denim Jacket',
    price: 156.00,
    curator: 'Alex Rivera',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  },
  {
    id: 3,
    name: 'Silk Evening Dress',
    price: 420.00,
    curator: 'Isabella Rossi',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  },
  {
    id: 4,
    name: 'Tokyo Streetwear Hoodie',
    price: 89.00,
    curator: 'Marcus Chen',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  },
  {
    id: 5,
    name: 'Italian Leather Bag',
    price: 320.00,
    curator: 'Isabella Rossi',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  },
  {
    id: 6,
    name: 'Parisian Silk Scarf',
    price: 78.00,
    curator: 'Sofia Laurent',
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  }
]

export default function FavoritesPage() {
  const [favoritesList, setFavoritesList] = useState(favorites)
  const [searchQuery, setSearchQuery] = useState('')

  const removeFavorite = (id: number) => {
    setFavoritesList(prev => prev.filter(item => item.id !== id))
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  // Filter favorites based on search query
  const filteredFavorites = favoritesList.filter(item => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.curator.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
            My Favorites
          </h1>
          <p className="text-lg text-warm-gray font-light mb-8">
            Your curated collection of favorite pieces
          </p>

          {/* Search Bar for Favorites */}
          {favoritesList.length > 5 && (
            <div className="max-w-md mb-8">
              <SearchBar
                variant="page"
                placeholder="Search your favorites…"
                onSearch={handleSearch}
              />
            </div>
          )}
        </motion.div>

        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFavorites.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden bg-stone rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-80 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 ease-out flex items-end">
                    <div className="w-full p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
                      <div className="flex items-center justify-between mb-4">
                        <button className="flex items-center space-x-2 bg-white text-carbon px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                          <ShoppingBag className="w-4 h-4" />
                          <span className="text-sm font-medium">Add to Cart</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFavorite(item.id)
                          }}
                          className="text-white hover:text-red-300 transition-colors"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <Link
                        href={`/product/${item.id}`}
                        className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View Product</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-serif text-xl font-light mb-1">
                    {item.name}
                  </h3>
                  <p className="text-warm-gray text-sm font-light mb-2">
                    Curated by {item.curator}
                  </p>
                  <p className="font-medium text-carbon">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-light mb-2">
              {searchQuery ? 'No favorites match your search' : "You haven't favorited anything yet"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms or browse all your favorites'
                : 'Start exploring curated pieces from your favorite influencers and save the ones you love'
              }
            </p>
            <Link
              href="/explore"
              className="inline-block bg-carbon text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              {searchQuery ? 'View All Favorites' : 'Start Exploring'}
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
} 