'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useT } from '@/hooks/useT'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface WishlistButtonProps {
  productId?: string // Optional, used for internal tracking
  productSlug: string // Required, used for API calls
  curatorSlug: string
  initialIsSaved?: boolean
  variant?: 'default' | 'icon-only'
}

export default function WishlistButton({
  productId,
  productSlug,
  curatorSlug,
  initialIsSaved = false,
  variant = 'default',
}: WishlistButtonProps) {
  const t = useT()
  const { data: session } = useSession()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isLoading, setIsLoading] = useState(false)

  // Sync with initial prop
  useEffect(() => {
    setIsSaved(initialIsSaved)
  }, [initialIsSaved])

  // Fetch wishlist status on mount if logged in
  useEffect(() => {
    if (!session?.user?.id) {
      setIsSaved(false)
      return
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/wishlist/products/by-slug/${productSlug}`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setIsSaved(data.isSaved)
        }
      } catch (error) {
        // Silently fail - user can still interact
        console.error('[WishlistButton] Error fetching status:', error)
      }
    }

    fetchStatus()
  }, [productSlug, session?.user?.id])

  const handleToggle = async () => {
    if (!session?.user?.id) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/curator/${curatorSlug}/product/${productSlug}`)}`)
      return
    }

    setIsLoading(true)
    const previousState = isSaved

    // Optimistic update
    setIsSaved(!isSaved)

    try {
      const method = isSaved ? 'DELETE' : 'POST'
      const response = await fetch(`/api/wishlist/products/by-slug/${productSlug}`, {
        method,
        credentials: 'include',
      })

      if (!response.ok) {
        // Revert on error
        setIsSaved(previousState)
        const data = await response.json()
        throw new Error(data.error || 'Failed to update wishlist')
      }

      const data = await response.json()
      setIsSaved(data.isSaved)
    } catch (error: any) {
      // Revert on error
      setIsSaved(previousState)
      console.error('[WishlistButton] Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        aria-pressed={isSaved}
        aria-label={isSaved ? t('wishlist.remove') : t('wishlist.save')}
        className={`p-2 rounded-lg transition-colors ${
          isSaved
            ? 'text-red-600 hover:bg-red-50'
            : 'text-neutral-600 hover:bg-neutral-100'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      aria-pressed={isSaved}
      aria-label={isSaved ? t('wishlist.remove') : t('wishlist.save')}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
        isSaved
          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      <span className="text-sm font-medium">
        {isSaved ? t('wishlist.saved') : t('wishlist.save')}
      </span>
    </button>
  )
}
