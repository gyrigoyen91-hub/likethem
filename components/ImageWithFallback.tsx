'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getProductImageUrl, getCuratorImageUrl } from '@/lib/cloudinary'
import { safeSrc } from '@/lib/img'

type ImageWithFallbackProps = {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  sizes?: string
  type?: 'product' | 'curator' | 'general'
  size?: 'thumbnail' | 'medium' | 'large' | 'original'
  curatorSize?: 'avatar' | 'banner' | 'original'
  quality?: number
  showBadge?: boolean // Show "Image coming soon" badge
}

// Branded fallback images
const FALLBACK_IMAGES = {
  product: '/images/avatar-placeholder.svg', // Neutral fashion placeholder
  curator: '/images/avatar-placeholder.svg',
  general: '/images/avatar-placeholder.svg',
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  sizes,
  type = 'general',
  size = 'medium',
  curatorSize = 'avatar',
  quality = 75,
  showBadge = false,
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  // Determine if we should use fallback
  const shouldUseFallback = !src || src.trim() === '' || hasError

  // Generate optimized URL based on type
  let optimizedSrc = src
  if (src && !hasError && src.includes('cloudinary.com')) {
    if (type === 'product') {
      optimizedSrc = getProductImageUrl(src, size)
    } else if (type === 'curator') {
      optimizedSrc = getCuratorImageUrl(src, curatorSize)
    }
  }

  // Set the source to use
  const finalSrc = shouldUseFallback 
    ? FALLBACK_IMAGES[type] 
    : safeSrc(optimizedSrc || '')

  // Generate responsive sizes for different breakpoints
  const responsiveSizes = {
    thumbnail: '(max-width: 640px) 100vw, 300px',
    medium: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px',
    large: '(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1200px',
    original: '100vw'
  }

  const finalSizes = type === 'product' ? responsiveSizes[size] : (sizes || responsiveSizes.medium)

  const handleLoad = () => {
    setIsLoading(false)
    setImageSrc(finalSrc)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    setImageSrc(FALLBACK_IMAGES[type])
  }

  // If no src provided initially, use fallback immediately
  if (!src || src.trim() === '') {
    return (
      <div className={`relative ${className}`}>
        <div 
          className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
          style={fill ? {} : { width, height }}
        >
          <svg
            className="w-1/3 h-1/3 text-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </div>
        {showBadge && (
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-gray-600 font-medium">
            Image coming soon
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={finalSrc}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        priority={priority}
        sizes={finalSizes}
        quality={quality}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } object-cover`}
        onLoad={handleLoad}
        onError={handleError}
      />
      {showBadge && shouldUseFallback && (
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-gray-600 font-medium">
          Image coming soon
        </div>
      )}
    </div>
  )
}

// Convenience components for specific use cases
export function ProductImageWithFallback({
  src,
  alt,
  size = 'medium',
  showBadge = false,
  ...props
}: Omit<ImageWithFallbackProps, 'type' | 'size'> & { 
  size?: 'thumbnail' | 'medium' | 'large' | 'original'
  showBadge?: boolean
}) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      type="product"
      size={size}
      showBadge={showBadge}
      {...props}
    />
  )
}

export function CuratorImageWithFallback({
  src,
  alt,
  size = 'original',
  ...props
}: Omit<ImageWithFallbackProps, 'type' | 'curatorSize' | 'size'> & { 
  size?: 'avatar' | 'banner' | 'original'
}) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      type="curator"
      curatorSize={size}
      {...props}
    />
  )
}
