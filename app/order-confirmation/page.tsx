'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Clock, AlertCircle, ArrowRight, Package, CreditCard, QrCode } from 'lucide-react'

interface OrderConfirmationProps {
  orderId?: string
  status?: string
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const status = searchParams.get('status')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setOrder(data.order)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return {
          icon: Clock,
          title: 'Payment Pending',
          description: 'Your order has been submitted and is waiting for payment confirmation.',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        }
      case 'PAID':
        return {
          icon: CheckCircle,
          title: 'Payment Confirmed',
          description: 'Your payment has been confirmed and your order is being processed.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'REJECTED':
        return {
          icon: AlertCircle,
          title: 'Payment Rejected',
          description: 'Your payment was not verified. Please contact support for assistance.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      default:
        return {
          icon: CheckCircle,
          title: 'Order Confirmed',
          description: 'Your order has been successfully placed and is being processed.',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
    }
  }

  const statusInfo = getStatusInfo(status || 'PENDING')

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Status Icon and Title */}
          <div className="mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusInfo.bgColor} ${statusInfo.borderColor} border-2 mb-6`}>
              <statusInfo.icon className={`w-10 h-10 ${statusInfo.color}`} />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
              {statusInfo.title}
            </h1>
            <p className="text-lg text-warm-gray font-light mb-8 max-w-2xl mx-auto">
              {statusInfo.description}
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gray-50 rounded-lg p-8 mb-8"
            >
              <h2 className="font-serif text-2xl font-light mb-6">Order Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-medium mb-3">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="capitalize">{order.status.replace('_', ' ').toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-8">
                <h3 className="font-medium mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg">
                      <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0]?.url || '/placeholder-product.jpg'}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.title}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                        {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                      </div>
                      <div className="text-right">
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {status === 'PENDING_PAYMENT' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-medium text-blue-800 mb-3">Next Steps</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>1. Complete your payment using the method you selected</p>
                  <p>2. Upload payment proof if you haven't already</p>
                  <p>3. Wait for payment verification (usually within 24 hours)</p>
                  <p>4. You'll receive an email confirmation once payment is verified</p>
                </div>
              </div>
            )}

            {status === 'PAID' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-medium text-green-800 mb-3">What's Next?</h3>
                <div className="text-sm text-green-700 space-y-2">
                  <p>1. Your order is being prepared for shipment</p>
                  <p>2. You'll receive tracking information via email</p>
                  <p>3. Expected delivery: 3-5 business days</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/orders"
                className="inline-flex items-center space-x-2 bg-carbon text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors duration-200"
              >
                <Package className="w-4 h-4" />
                <span>View My Orders</span>
              </Link>
              
              <Link
                href="/explore"
                className="inline-flex items-center space-x-2 bg-white text-carbon border border-carbon px-6 py-3 font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* Support Contact */}
            <div className="text-sm text-gray-500">
              <p>Need help? Contact us at{' '}
                <a href="mailto:support@likethem.com" className="text-carbon hover:underline">
                  support@likethem.com
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 