'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface FavoriteItem {
  id: string
  name: string
  curator: string
  price: number
  image: string
  size?: string
  color?: string
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  addToFavorites: (item: FavoriteItem) => void
  removeFromFavorites: (itemId: string) => void
  toggleFavorite: (item: FavoriteItem) => void
  isFavorite: (itemId: string) => boolean
  clearFavorites: () => void
  getFavoritesCount: () => number
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('likethem-favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error)
      }
    }
  }, [])

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('likethem-favorites', JSON.stringify(favorites))
  }, [favorites])

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites(prevFavorites => {
      const exists = prevFavorites.find(fav => fav.id === item.id)
      if (!exists) {
        return [...prevFavorites, item]
      }
      return prevFavorites
    })
  }

  const removeFromFavorites = (itemId: string) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(item => item.id !== itemId)
    )
  }

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites(prevFavorites => {
      const exists = prevFavorites.find(fav => fav.id === item.id)
      if (exists) {
        return prevFavorites.filter(fav => fav.id !== item.id)
      } else {
        return [...prevFavorites, item]
      }
    })
  }

  const isFavorite = (itemId: string) => {
    return favorites.some(item => item.id === itemId)
  }

  const clearFavorites = () => {
    setFavorites([])
  }

  const getFavoritesCount = () => {
    return favorites.length
  }

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    getFavoritesCount
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
} 