'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getProductImageUrl, getCuratorImageUrl } from '@/lib/cloudinary'
import { safeSrc } from '@/lib/img'

// Branded fallback images
const FALLBACK_IMAGES = {
  product: '/images/avatar-placeholder.svg',
  curator: '/images/avatar-placeholder.svg',
  general: '/images/avatar-placeholder.svg',
}

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  type?: 'product' | 'curator' | 'general'
  size?: 'thumbnail' | 'medium' | 'large' | 'original'
  curatorSize?: 'avatar' | 'banner' | 'original'
  fill?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  type = 'general',
  size = 'medium',
  curatorSize = 'avatar',
  fill = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate optimized URL based on type
  let optimizedSrc = src
  if (src && src.includes('cloudinary.com')) {
    if (type === 'product') {
      optimizedSrc = getProductImageUrl(src, size)
    } else if (type === 'curator') {
      optimizedSrc = getCuratorImageUrl(src, curatorSize)
    }
  }

  // Generate responsive sizes for different breakpoints
  const responsiveSizes = {
    thumbnail: '(max-width: 640px) 100vw, 300px',
    medium: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px',
    large: '(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1200px',
    original: '100vw'
  }

  const finalSizes = type === 'product' ? responsiveSizes[size] : sizes

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    onError?.()
  }

  // Show placeholder while loading
  if (isLoading && placeholder === 'blur' && blurDataURL) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={blurDataURL}
          alt=""
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className="object-cover"
          priority={priority}
          sizes={finalSizes}
          quality={quality}
        />
      </div>
    )
  }

  // Show error state - use branded fallback
  if (hasError) {
    const fallbackSrc = type === 'product' 
      ? FALLBACK_IMAGES.product 
      : type === 'curator' 
      ? FALLBACK_IMAGES.curator 
      : FALLBACK_IMAGES.general
    
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
      </div>
    )
  }

  return (
    <Image
      src={safeSrc(optimizedSrc)}
      alt={alt}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
      fill={fill}
      priority={priority}
      sizes={finalSizes}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoad={handleLoad}
      onError={handleError}
    />
  )
}

// Convenience components for specific use cases
export function ProductImage({
  src,
  alt,
  size = 'medium',
  ...props
}: Omit<OptimizedImageProps, 'type' | 'size'> & { size?: 'thumbnail' | 'medium' | 'large' | 'original' }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      type="product"
      size={size}
      {...props}
    />
  )
}

export function CuratorImage({
  src,
  alt,
  size = 'original',
  ...props
}: Omit<OptimizedImageProps, 'type' | 'curatorSize'> & { size?: 'avatar' | 'banner' | 'original' }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      type="curator"
      curatorSize={size as 'avatar' | 'banner' | 'original'}
      {...props}
    />
  )
}

export function ResponsiveImage({
  src,
  alt,
  sizes,
  ...props
}: OptimizedImageProps & { sizes: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      sizes={sizes}
      {...props}
    />
  )
} 