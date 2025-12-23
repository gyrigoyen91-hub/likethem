'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

interface CartItem {
  id: string
  name: string
  curator: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
  productId?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  syncWithDatabase: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount (for unauthenticated users)
  useEffect(() => {
    if (status === 'unauthenticated') {
      const savedCart = localStorage.getItem('likethem-cart')
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (error) {
          console.error('Error loading cart from localStorage:', error)
        }
      }
    }
  }, [status])

  // Load cart from database when user is authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      syncWithDatabase()
    }
  }, [status, session?.user?.id])

  // Save cart to localStorage for unauthenticated users
  useEffect(() => {
    if (status === 'unauthenticated') {
      localStorage.setItem('likethem-cart', JSON.stringify(items))
    }
  }, [items, status])

  const syncWithDatabase = async () => {
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Error syncing cart with database:', error)
    }
  }

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    // Immediately update local state for better UX
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id)
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevItems, { ...newItem, quantity: 1 }]
      }
    })

    if (status === 'authenticated') {
      // For authenticated users, also sync with database
      fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: newItem.productId,
          quantity: 1,
          size: newItem.size,
          color: newItem.color
        }),
        credentials: 'include'
      })
      .then(response => {
        if (response.ok) {
          // Refresh cart from database to ensure consistency
          return syncWithDatabase()
        }
        throw new Error('Failed to add item to cart')
      })
      .catch(error => {
        console.error('Error adding item to cart:', error)
        // Optionally revert local state on error
      })
    }
    // For unauthenticated users, localStorage is already handled by the useEffect
  }

  const removeItem = async (itemId: string) => {
    if (status === 'authenticated') {
      // For authenticated users, remove from database
      try {
        const response = await fetch(`/api/cart?itemId=${itemId}`, {
          method: 'DELETE',
          credentials: 'include'
        })

        if (response.ok) {
          await syncWithDatabase()
        }
      } catch (error) {
        console.error('Error removing item from cart:', error)
      }
    } else {
      // For unauthenticated users, use localStorage
      setItems(prevItems => prevItems.filter(item => item.id !== itemId))
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    if (status === 'authenticated') {
      // For authenticated users, update in database
      try {
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId,
            quantity
          }),
          credentials: 'include'
        })

        if (response.ok) {
          await syncWithDatabase()
        }
      } catch (error) {
        console.error('Error updating cart item quantity:', error)
      }
    } else {
      // For unauthenticated users, use localStorage
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = async () => {
    if (status === 'authenticated') {
      // For authenticated users, clear from database
      try {
        const response = await fetch('/api/cart', {
          method: 'DELETE',
          credentials: 'include'
        })

        if (response.ok) {
          setItems([])
        }
      } catch (error) {
        console.error('Error clearing cart:', error)
      }
    } else {
      // For unauthenticated users, use localStorage
      setItems([])
    }
  }

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    syncWithDatabase
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 