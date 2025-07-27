'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getProductImageUrl, getCuratorImageUrl } from '@/lib/cloudinary'

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

  // Show error state
  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <span className="text-gray-500 text-sm">Image not available</span>
      </div>
    )
  }

  return (
    <Image
      src={optimizedSrc}
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
  size = 'avatar',
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