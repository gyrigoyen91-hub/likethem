'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Package, Calendar, DollarSign, Eye, Truck, CheckCircle, Clock } from 'lucide-react'

const orders = [
  {
    id: 'ORD-2024-001',
    product: {
      name: 'Minimalist Cotton Blazer',
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      curator: 'Sofia Laurent'
    },
    status: 'Delivered',
    date: '2024-01-15',
    total: 289.00,
    tracking: '1Z999AA1234567890'
  },
  {
    id: 'ORD-2024-002',
    product: {
      name: 'Vintage Denim Jacket',
      image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      curator: 'Alex Rivera'
    },
    status: 'In Transit',
    date: '2024-01-20',
    total: 156.00,
    tracking: '1Z999AA1234567891'
  },
  {
    id: 'ORD-2024-003',
    product: {
      name: 'Silk Evening Dress',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      curator: 'Isabella Rossi'
    },
    status: 'Processing',
    date: '2024-01-25',
    total: 420.00,
    tracking: null
  }
]

const statusConfig = {
  'Delivered': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  'In Transit': { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
  'Processing': { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' }
}

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
            My Orders
          </h1>
          <p className="text-lg text-warm-gray font-light">
            Track your orders and view order history
          </p>
        </motion.div>

        <div className="space-y-8">
          {orders.map((order, index) => {
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
            const StatusIcon = statusInfo.icon

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Product Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={order.product.image}
                          alt={order.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-light mb-1">
                          {order.product.name}
                        </h3>
                        <p className="text-sm text-warm-gray mb-2">
                          Curated by {order.product.curator}
                        </p>
                        <p className="text-sm text-gray-500">
                          Order #{order.id}
                        </p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 lg:gap-2">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <Link
                        href={`/orders/${order.id}`}
                        className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-light mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring curated pieces from your favorite influencers
            </p>
            <Link
              href="/explore"
              className="inline-block bg-carbon text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
            >
              Explore Stores
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
} 