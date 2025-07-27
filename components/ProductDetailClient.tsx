'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Heart, Share2, ShoppingCart, Star } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/CartContext'
import OptimizedImage, { ProductImage } from '@/components/OptimizedImage'
import { CuratorImage } from '@/components/OptimizedImage'
import Toast from '@/components/Toast'

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  tags: string
  sizes: string
  colors: string
  stockQuantity: number
  curatorNote?: string | null
  slug: string
  createdAt: string
  updatedAt: string
  curator: {
    id: string
    storeName: string
    bio?: string | null
    slug: string
    user: {
      fullName?: string | null
    }
  }
  images: Array<{
    id: string
    url: string
    altText?: string | null
    order: number
  }>
}

interface ProductDetailClientProps {
  product: Product
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { data: session, status } = useSession()
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showAddedFeedback, setShowAddedFeedback] = useState(false)
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    isVisible: boolean
  } | null>(null)

  // Parse sizes and colors from strings
  const parseArrayFromString = (str: string): string[] => {
    if (!str) return []
    try {
      return JSON.parse(str)
    } catch {
      return str.split(',').map(s => s.trim()).filter(s => s)
    }
  }

  const parsedSizes = parseArrayFromString(product.sizes)
  const parsedColors = parseArrayFromString(product.colors)

  const validateSelections = (): boolean => {
    // Only require size selection if there are multiple sizes and not "One Size"
    if (parsedSizes.length > 1 || (parsedSizes.length === 1 && parsedSizes[0] !== 'One Size')) {
      if (!selectedSize) {
        setToast({
          type: 'error',
          message: 'Please select a size',
          isVisible: true
        })
        return false
      }
    }

    // Only require color selection if there are multiple colors
    if (parsedColors.length > 1) {
      if (!selectedColor) {
        setToast({
          type: 'error',
          message: 'Please select a color',
          isVisible: true
        })
        return false
      }
    }

    return true
  }

  const handleAddToCart = () => {
    if (!product || !validateSelections()) {
      return
    }

    if (status === 'unauthenticated') {
      setToast({
        type: 'info',
        message: 'Please sign in to add items to your cart.',
        isVisible: true
      })
      return
    }

    if (status === 'loading') {
      return // Wait for authentication to load
    }

    setIsAddingToCart(true)
    
    // Determine the size and color to use
    const finalSize = selectedSize || (parsedSizes.length > 0 ? parsedSizes[0] : 'One Size')
    const finalColor = selectedColor || (parsedColors.length > 1 ? parsedColors[0] : 'Default')
    
    // Use the cart context to add the item
    addItem({
      id: `${product.id}-${finalSize}-${finalColor}`,
      name: `${product.title} (${finalSize}, ${finalColor})`,
      curator: product.curator.storeName,
      price: product.price,
      image: product.images[0]?.url || '',
      productId: product.id,
      size: finalSize !== 'One Size' ? finalSize : undefined,
      color: parsedColors.length > 1 ? finalColor : undefined
    })

    setShowAddedFeedback(true)
    setTimeout(() => setShowAddedFeedback(false), 2000)
    
    setToast({
      type: 'success',
      message: 'Added to cart successfully!',
      isVisible: true
    })
    
    setIsAddingToCart(false)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${product.slug}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: url
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setToast({
          type: 'success',
          message: 'Link copied to clipboard!',
          isVisible: true
        })
      } catch (error) {
        console.error('Failed to copy URL:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="container-custom max-w-7xl py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/explore"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Explore</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Heart className="w-5 h-5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="container-custom max-w-7xl pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <ProductImage
                src={product.images[selectedImage]?.url || product.images[0]?.url || '/placeholder-product.jpg'}
                alt={product.title}
                size="large"
                fill
                className="object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square relative overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === index ? 'border-gray-900' : 'border-gray-200'
                    }`}
                  >
                    <ProductImage
                      src={image.url}
                      alt={image.altText || product.title}
                      size="thumbnail"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Curator Info */}
            <div className="flex items-center gap-3">
              <Link href={`/curator/${product.curator.slug}`}>
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <OptimizedImage
                    src="/default-avatar.png"
                    alt={product.curator.storeName}
                    type="curator"
                    curatorSize="avatar"
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <div>
                <Link 
                  href={`/curator/${product.curator.slug}`}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Curated by {product.curator.storeName}
                </Link>
                {product.curator.user.fullName && (
                  <p className="text-xs text-gray-500">
                    by {product.curator.user.fullName}
                  </p>
                )}
              </div>
            </div>

            {/* Product Title and Price */}
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-light text-gray-900 mb-2">
                {product.title}
              </h1>
              <p className="text-2xl font-semibold text-gray-900">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {/* Curator Note */}
            {product.curatorNote && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  "{product.curatorNote}"
                </p>
              </div>
            )}

            {/* Size Selection */}
            {parsedSizes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {parsedSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {parsedColors.length > 1 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                <div className="grid grid-cols-3 gap-2">
                  {parsedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                        selectedColor === color
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`w-full py-4 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                showAddedFeedback
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400'
              }`}
            >
              {isAddingToCart ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : showAddedFeedback ? (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>

            {/* Product Description */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Details */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Details</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="text-gray-900">{product.category}</span>
                </div>
                {product.tags && (
                  <div className="flex justify-between">
                    <span>Tags:</span>
                    <span className="text-gray-900">{product.tags}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Stock:</span>
                  <span className="text-gray-900">{product.stockQuantity} available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 