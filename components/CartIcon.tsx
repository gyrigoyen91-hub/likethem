'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface CartIconProps {
  onClick: () => void
  className?: string
}

export default function CartIcon({ onClick, className = '' }: CartIconProps) {
  const { getItemCount } = useCart()
  const [showTooltip, setShowTooltip] = useState(false)
  
  const itemCount = getItemCount()

  return (
    <div className="relative">
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`relative p-2 text-carbon hover:text-black transition-colors duration-200 ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingBag className="w-5 h-5" />
        
        {/* Badge */}
        {itemCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-carbon text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </motion.div>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-50"
          >
            View Cart
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 