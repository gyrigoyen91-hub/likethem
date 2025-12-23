'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useT } from '@/hooks/useT'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  curatorId?: string // Optional, used for internal tracking
  curatorSlug: string // Required, used for API calls
  initialIsFollowing?: boolean
  variant?: 'default' | 'compact'
}

export default function FollowButton({
  curatorId,
  curatorSlug,
  initialIsFollowing = false,
  variant = 'default',
}: FollowButtonProps) {
  const t = useT()
  const { data: session } = useSession()
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  // Sync with initial prop
  useEffect(() => {
    setIsFollowing(initialIsFollowing)
  }, [initialIsFollowing])

  // Fetch follow status on mount if logged in
  useEffect(() => {
    if (!session?.user?.id) {
      setIsFollowing(false)
      return
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/follow/curators/by-slug/${curatorSlug}`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setIsFollowing(data.isFollowing)
        }
      } catch (error) {
        // Silently fail - user can still interact
        console.error('[FollowButton] Error fetching status:', error)
      }
    }

    fetchStatus()
  }, [curatorSlug, session?.user?.id])

  const handleToggle = async () => {
    if (!session?.user?.id) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/curator/${curatorSlug}`)}`)
      return
    }

    setIsLoading(true)
    const previousState = isFollowing

    // Optimistic update
    setIsFollowing(!isFollowing)

    try {
      const method = isFollowing ? 'DELETE' : 'POST'
      const response = await fetch(`/api/follow/curators/by-slug/${curatorSlug}`, {
        method,
        credentials: 'include',
      })

      if (!response.ok) {
        // Revert on error
        setIsFollowing(previousState)
        const data = await response.json()
        throw new Error(data.error || 'Failed to update follow status')
      }

      const data = await response.json()
      setIsFollowing(data.isFollowing)
    } catch (error: any) {
      // Revert on error
      setIsFollowing(previousState)
      console.error('[FollowButton] Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        aria-pressed={isFollowing}
        aria-label={isFollowing ? t('curator.unfollow') : t('curator.follow')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          isFollowing
            ? 'bg-black text-white hover:bg-neutral-800'
            : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
        <span>{isFollowing ? t('curator.following') : t('curator.follow')}</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      aria-pressed={isFollowing}
      aria-label={isFollowing ? t('curator.unfollow') : t('curator.follow')}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
        isFollowing
          ? 'bg-black text-white hover:bg-neutral-800'
          : 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''}`} />
      <span>{isFollowing ? t('curator.following') : t('curator.follow')}</span>
    </button>
  )
}
