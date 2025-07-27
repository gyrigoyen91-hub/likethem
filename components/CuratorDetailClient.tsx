'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Heart, Share2, Instagram, Twitter, Youtube } from 'lucide-react'
import { ProductImage } from '@/components/OptimizedImage'
import { CuratorImage } from '@/components/OptimizedImage'

interface Curator {
  id: string
  storeName: string
  bio?: string
  bannerImage?: string
  instagram?: string
  tiktok?: string
  youtube?: string
  twitter?: string
  isEditorsPick: boolean
  slug: string
  user: {
    id: string
    fullName?: string
    avatar?: string
  }
  products: Array<{
    id: string
    title: string
    description: string
    price: number
    category: string
    tags: string
    sizes: string
    colors: string
    stockQuantity: number
    curatorNote?: string
    slug: string
    createdAt: string
    updatedAt: string
    images: Array<{
      id: string
      url: string
      altText?: string
      order: number
    }>
  }>
}

interface CuratorDetailClientProps {
  curator: Curator
}

export default function CuratorDetailClient({ curator }: CuratorDetailClientProps) {
  const [showShareToast, setShowShareToast] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/curator/${curator.slug}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: curator.storeName,
          text: curator.bio || `Check out ${curator.storeName}'s curated collection`,
          url: url
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setShowShareToast(true)
        setTimeout(() => setShowShareToast(false), 2000)
      } catch (error) {
        console.error('Failed to copy URL:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Share Toast */}
      {showShareToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg z-50"
        >
          Link copied to clipboard!
        </motion.div>
      )}

      {/* Header */}
      <div className="relative">
        {/* Banner Image */}
        {curator.bannerImage && (
          <div className="h-64 md:h-80 relative overflow-hidden">
            <CuratorImage
              src={curator.bannerImage}
              alt={`${curator.storeName} banner`}
              size="original"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30" />
          </div>
        )}

        {/* Header Content */}
        <div className="container-custom max-w-7xl relative z-10">
          <div className="flex items-center justify-between py-6">
            <Link
              href="/explore"
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Explore</span>
            </Link>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Curator Info */}
          <div className="flex items-end gap-6 pb-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <CuratorImage
                  src={curator.user.avatar || '/default-avatar.png'}
                  alt={curator.storeName}
                  size="original"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              {curator.isEditorsPick && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  Editor's Pick
                </div>
              )}
            </div>

            {/* Curator Details */}
            <div className="flex-1 text-white">
              <h1 className="font-serif text-3xl md:text-4xl font-light mb-2">
                {curator.storeName}
              </h1>
              {curator.user.fullName && (
                <p className="text-lg opacity-90 mb-4">
                  by {curator.user.fullName}
                </p>
              )}
              {curator.bio && (
                <p className="text-lg opacity-90 max-w-2xl">
                  {curator.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      {(curator.instagram || curator.twitter || curator.youtube || curator.tiktok) && (
        <div className="container-custom max-w-7xl py-6">
          <div className="flex items-center gap-4">
            {curator.instagram && (
              <a
                href={`https://instagram.com/${curator.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
            )}
            {curator.twitter && (
              <a
                href={`https://twitter.com/${curator.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
            )}
            {curator.youtube && (
              <a
                href={`https://youtube.com/${curator.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Youtube className="w-6 h-6" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="container-custom max-w-7xl py-12">
        <h2 className="font-serif text-2xl md:text-3xl font-light text-gray-900 mb-8">
          Curated Collection ({curator.products.length} items)
        </h2>

        {curator.products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {curator.products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Link href={`/product/${product.slug}`}>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {/* Product Image */}
                    <div className="aspect-square relative overflow-hidden">
                      <ProductImage
                        src={product.images[0]?.url || '/placeholder-product.jpg'}
                        alt={product.title}
                        size="medium"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-lg font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </p>
                      {product.curatorNote && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {product.curatorNote}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 