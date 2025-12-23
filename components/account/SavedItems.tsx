'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useT } from '@/hooks/useT'
import { ProductImageWithFallback } from '@/components/ImageWithFallback'
import { Heart } from 'lucide-react'

interface SavedItem {
  id: string
  productId: string
  productSlug: string
  title: string
  price: number
  imageUrl: string | null
  curatorSlug: string
  curatorName: string
  createdAt: string
}

export default function SavedItems() {
  const t = useT()
  const [items, setItems] = useState<SavedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch('/api/wishlist', {
          credentials: 'include',
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required')
            return
          }
          throw new Error('Failed to fetch wishlist')
        }

        const data = await response.json()
        setItems(data.items || [])
      } catch (err: any) {
        console.error('[SavedItems] Error:', err)
        setError(err.message || 'Failed to load saved items')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  const handleRemove = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/wishlist`, {
        method: 'DELETE',
        credentials: 'include',
      })

          if (response.ok) {
            // Remove from local state
            setItems(prev => prev.filter(item => item.productSlug !== productSlug))
          }
    } catch (err) {
      console.error('[SavedItems] Error removing item:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3 className="font-serif text-lg font-light">{t('account.savedItems.title')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-neutral-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h3 className="font-serif text-lg font-light">{t('account.savedItems.title')}</h3>
        <p className="text-sm text-neutral-600">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="font-serif text-lg font-light">{t('account.savedItems.title')}</h3>
        <div className="text-center py-12 border border-neutral-200 rounded-lg">
          <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 mb-2">{t('account.savedItems.empty')}</p>
          <Link
            href="/explore"
            className="text-sm text-neutral-900 underline hover:no-underline"
          >
            {t('account.savedItems.browse')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-light">{t('account.savedItems.title')}</h3>
        <span className="text-sm text-neutral-600">
          {items.length} {items.length === 1 ? t('account.savedItems.item') : t('account.savedItems.items')}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="group relative">
            <Link
              href={`/curator/${item.curatorSlug}/product/${item.productSlug}`}
              className="block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-neutral-100 mb-2">
                <ProductImageWithFallback
                  src={item.imageUrl}
                  alt={item.title}
                  size="medium"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-neutral-900 line-clamp-1">
                  {item.title}
                </p>
                <p className="text-xs text-neutral-600 line-clamp-1">
                  {item.curatorName}
                </p>
                <p className="text-sm font-medium text-neutral-900">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault()
                handleRemove(item.productSlug)
              }}
              className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label={t('wishlist.remove')}
            >
              <Heart className="h-4 w-4 text-red-600 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
