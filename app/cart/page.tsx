'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCart()

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, quantity)
    }
  }

  const subtotal = getSubtotal()
  const shipping = 0 // Will be calculated at checkout
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-24">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
              Your Cart is Empty
            </h1>
            <p className="text-lg text-warm-gray font-light mb-8 max-w-md mx-auto">
              Start exploring curated pieces from your favorite influencers
            </p>
            <Link
              href="/explore"
              className="inline-block bg-carbon text-white px-8 py-4 font-medium tracking-wider uppercase text-sm hover:bg-gray-800 transition-colors duration-200"
            >
              Discover Curators
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-6xl">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/explore"
              className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Continue Shopping</span>
            </Link>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-light">
            Your Cart
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-6 p-6 border border-gray-200 rounded-lg"
                >
                  {/* Product Image */}
                  <div className="w-24 h-32 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.id}`}
                      className="block mb-2"
                    >
                      <h3 className="font-serif text-xl font-light hover:text-carbon transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-4">
                      Curated by {item.curator}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <select
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-carbon"
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="font-serif text-lg font-light">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Cart Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-serif text-2xl font-light mb-6">Order Summary</h2>

              {/* Summary Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-sm text-gray-500">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Estimated Total</span>
                    <span className="font-serif text-xl font-light">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Promo Code</label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                  />
                  <button className="px-4 py-3 bg-carbon text-white hover:bg-gray-800 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link
                  href="/explore"
                  className="block w-full border border-carbon text-carbon py-3 px-4 font-medium text-center hover:bg-carbon hover:text-white transition-colors duration-200"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/checkout"
                  className="block w-full bg-carbon text-white py-3 px-4 font-medium text-center hover:bg-gray-800 transition-colors duration-200"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 