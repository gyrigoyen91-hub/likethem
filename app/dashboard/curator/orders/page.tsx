'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Package, Eye, DollarSign, User, Mail } from 'lucide-react'

interface Order {
  id: string
  status: string
  totalAmount: number
  paymentMethod: string
  transactionCode?: string
  paymentProof?: string
  createdAt: string
  buyer: {
    fullName: string
    email: string
  }
  shippingAddress: {
    fullName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      title: string
      images: Array<{ url: string }>
    }
  }>
}

export default function CuratorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status }),
        credentials: 'include'
      })

      if (response.ok) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ))
        
        // Close modal if open
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null)
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'CONFIRMED':
        return <Package className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800'
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-24">
        <div className="container-custom max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
            Orders
          </h1>
          <p className="text-lg text-warm-gray font-light">
            Manage your store orders and payment confirmations
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-light">{orders.filter(o => o.status === 'PENDING_PAYMENT').length}</p>
                <p className="text-sm text-gray-600">Pending Payment</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-light">{orders.filter(o => o.status === 'PAID').length}</p>
                <p className="text-sm text-gray-600">Paid</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-light">{orders.filter(o => o.status === 'CONFIRMED').length}</p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-light">
                  ${orders.reduce((total, order) => total + order.totalAmount, 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING_PAYMENT', 'PAID', 'REJECTED', 'CONFIRMED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-carbon text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Orders' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Orders List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4"
        >
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-medium">Order #{order.id.slice(-8)}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-600 hover:text-carbon transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{order.buyer.fullName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{order.buyer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                </div>

                {/* Action Buttons for Pending Payment Orders */}
                {order.status === 'PENDING_PAYMENT' && (
                  <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PAID')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Paid</span>
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'REJECTED')}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Payment</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </motion.div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl font-light">
                    Order Details
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-medium mb-3">Order Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-mono">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="capitalize">{selectedOrder.paymentMethod}</span>
                      </div>
                      {selectedOrder.transactionCode && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction Code:</span>
                          <span className="font-mono">{selectedOrder.transactionCode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Shipping Address</h3>
                    <div className="text-sm text-gray-600">
                      <p>{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.address}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Proof */}
                {selectedOrder.paymentProof && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Payment Proof</h3>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <img
                        src={selectedOrder.paymentProof}
                        alt="Payment Proof"
                        className="max-w-full h-auto rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Items Ordered</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product.title}</h4>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedOrder.status === 'PENDING_PAYMENT' && (
                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'PAID')
                        setSelectedOrder(null)
                      }}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Paid</span>
                    </button>
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'REJECTED')
                        setSelectedOrder(null)
                      }}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Payment</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
} 