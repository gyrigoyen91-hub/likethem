export interface CloudinaryConfig {
  cloudName: string
  uploadPreset: string
  apiKey: string
  apiSecret: string
}

export function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }
}

export function optimizeCloudinaryUrl(
  url: string, 
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
    crop?: 'fill' | 'scale' | 'fit' | 'thumb'
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options

  // Parse the Cloudinary URL
  const urlParts = url.split('/upload/')
  if (urlParts.length !== 2) {
    return url
  }

  const baseUrl = urlParts[0] + '/upload'
  const transformations: string[] = []

  // Add transformations
  if (width || height) {
    const size = `${crop}${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''}`
    transformations.push(size)
  }

  transformations.push(`f_${format}`)
  transformations.push(`q_${quality}`)

  const transformationString = transformations.join('/')
  const path = urlParts[1]

  return `${baseUrl}/${transformationString}/${path}`
}

export function getResponsiveCloudinaryUrl(
  url: string,
  sizes: { width: number; height?: number }[]
): string[] {
  return sizes.map(size => optimizeCloudinaryUrl(url, size))
}

export function getProductImageUrl(
  url: string,
  size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'
): string {
  const sizes = {
    thumbnail: { width: 300, height: 300, crop: 'thumb' as const },
    medium: { width: 600, height: 600, crop: 'fill' as const },
    large: { width: 1200, height: 1200, crop: 'fill' as const },
    original: {}
  }

  return optimizeCloudinaryUrl(url, sizes[size])
}

export function getCuratorImageUrl(
  url: string,
  size: 'avatar' | 'banner' | 'original' = 'avatar'
): string {
  const sizes = {
    avatar: { width: 200, height: 200, crop: 'thumb' as const },
    banner: { width: 1200, height: 400, crop: 'fill' as const },
    original: {}
  }

  return optimizeCloudinaryUrl(url, sizes[size])
}

export function generateCloudinaryUploadUrl(): string {
  const config = getCloudinaryConfig()
  return `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`
}

export function getCloudinaryUploadPreset(): string {
  return getCloudinaryConfig().uploadPreset
} 