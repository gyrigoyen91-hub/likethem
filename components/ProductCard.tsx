'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, ShoppingCart, Heart } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import Toast from './Toast'

interface ProductCardProps {
  id: string | number
  imageUrl: string
  name: string
  brand: string
  size: string
  condition: string
  price: string
  tag?: string
  curator?: string
  slug?: string
  onClick?: () => void
  className?: string
}

export default function ProductCard({
  id,
  imageUrl,
  name,
  brand,
  size,
  condition,
  price,
  tag,
  curator = 'Unknown Curator',
  slug,
  onClick,
  className = ''
}: ProductCardProps) {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success')
  
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  // Generate product href
  const productHref = `/product/${slug || String(id)}`

  // Detect mobile on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (isAddingToCart) return
    
    setIsAddingToCart(true)
    
    try {
      const cartItem = {
        id: String(id),
        name: name,
        curator: curator,
        price: parseFloat(price),
        image: imageUrl,
        size: size,
        productId: String(id)
      }
      
      addItem(cartItem)
      
      setToastMessage('✅ Added to your cart.')
      setToastType('success')
      setShowToast(true)
    } catch (error) {
      setToastMessage('❌ Failed to add to cart.')
      setToastType('error')
      setShowToast(true)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    const favoriteItem = {
      id: String(id),
      name: name,
      curator: curator,
      price: parseFloat(price),
      image: imageUrl,
      size: size
    }
    
    // Check if currently favorite BEFORE toggling
    const isCurrentlyFavorite = isFavorite(String(id))
    
    toggleFavorite(favoriteItem)
    
    // Show the correct message based on the action taken
    if (isCurrentlyFavorite) {
      setToastMessage('💔 Removed from favorites')
    } else {
      setToastMessage('❤️ Added to favorites')
    }
    setToastType('info')
    setShowToast(true)
  }

  const handleCardClick = () => {
    if (isMobile) {
      if (!isOverlayVisible) {
        setIsOverlayVisible(true)
      } else {
        onClick?.()
      }
    } else {
      onClick?.()
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleCardClick()
    }
    if (e.key === 'Escape' && isOverlayVisible) {
      setIsOverlayVisible(false)
    }
  }

  return (
    <div className={`group relative ${className}`}>
      {/* Heart Button - Always on top with highest z-index */}
      <motion.button
        className="absolute top-3 right-3 z-30 p-2 bg-white/90 rounded-full shadow transition-all duration-200 hover:scale-110"
        onClick={handleToggleFavorite}
        aria-label={isFavorite(String(id)) ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={isFavorite(String(id))}
        whileTap={{ scale: 1.2 }}
        transition={{ duration: 0.2 }}
      >
        <Heart
          className={`w-4 h-4 ${
            isFavorite(String(id)) 
              ? 'text-red-500 fill-red-500' 
              : 'text-gray-600'
          }`}
        />
      </motion.button>

      {/* Product Image Container */}
      <div 
        className="relative overflow-hidden rounded-lg bg-gray-100 cursor-pointer"
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${name} by ${brand}`}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Tag */}
        {tag && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {tag}
          </div>
        )}

        {/* Desktop Hover Overlay - Lower z-index, pointer-events: none */}
        <div
          className="absolute inset-0 bg-black/65 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20"
        >
          <div className="text-center text-white">
            <div className="mb-4">
              <p className="font-bold text-lg mb-1">{brand}</p>
              <p className="text-sm mb-1">Size: {size}</p>
              <p className="text-xs opacity-80">{condition}</p>
            </div>
            {/* Overlay controls - Re-enable pointer events */}
            <div className="flex flex-col gap-2 pointer-events-auto">
              <Link
                href={productHref}
                className="px-6 py-2 border border-white rounded-full text-white hover:bg-white hover:text-black transition-colors duration-200 flex items-center gap-2 mx-auto"
                aria-label="View product details"
                prefetch={false}
              >
                <Eye className="w-4 h-4" />
                View Details
              </Link>
              <button
                className={`px-6 py-2 border border-white rounded-full text-white hover:bg-white hover:text-black transition-colors duration-200 flex items-center gap-2 mx-auto ${
                  isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tap Overlay */}
        <AnimatePresence>
          {isMobile && isOverlayVisible && (
            <motion.div
              className="absolute inset-0 bg-black/65 flex items-center justify-center p-4 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center text-white">
                <div className="mb-4">
                  <p className="font-bold text-lg mb-1">{brand}</p>
                  <p className="text-sm mb-1">Size: {size}</p>
                  <p className="text-xs opacity-80">{condition}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Link
                    href={productHref}
                    className="px-6 py-2 border border-white rounded-full text-white hover:bg-white hover:text-black transition-colors duration-200 flex items-center gap-2 mx-auto"
                    aria-label="View product details"
                    prefetch={false}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                  <button
                    className={`px-6 py-2 border border-white rounded-full text-white hover:bg-white hover:text-black transition-colors duration-200 flex items-center gap-2 mx-auto ${
                      isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h4 className="font-medium text-sm mb-1 line-clamp-2">{name}</h4>
        <p className="text-gray-600 text-sm font-medium">${price}</p>
      </div>

      {/* Mobile Tap Outside to Close */}
      {isMobile && isOverlayVisible && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOverlayVisible(false)}
        />
      )}

      {/* Toast Notification */}
      <Toast
        type={toastType}
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  )
}
