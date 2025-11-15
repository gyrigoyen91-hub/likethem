'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { ArrowLeft, Lock, CreditCard, MapPin, User, Mail, Phone, QrCode, Upload, FileText } from 'lucide-react'

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'yape' | 'plin'>('stripe')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [transactionCode, setTransactionCode] = useState('')
  const router = useRouter()

  const subtotal = getSubtotal()
  const shipping = 15.00 // Example shipping cost
  const tax = subtotal * 0.08 // Example tax rate
  const total = subtotal + shipping + tax

  const [formData, setFormData] = useState({
    // Shipping Information
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    
    // Billing
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingZipCode: '',
    billingCountry: 'United States'
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid file type: JPG, PNG, or PDF')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      setPaymentProof(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: undefined, // Will be added when we enhance cart items
          color: undefined, // Will be added when we enhance cart items
          curatorId: 'default' // Will be enhanced when we add curator info to cart
        })),
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod,
        transactionCode: transactionCode || undefined,
        paymentProof: null // Will be handled separately
      }

      // Upload payment proof if provided
      if (paymentProof) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', paymentProof)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
          credentials: 'include'
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          orderData.paymentProof = uploadResult.url
        }
      }

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData),
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        clearCart()
        setIsProcessing(false)
        
        // Redirect based on payment method
        if (paymentMethod === 'stripe') {
          router.push('/order-confirmation')
        } else {
          router.push(`/order-confirmation?orderId=${result.order.id}&status=${result.order.status}`)
        }
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('An error occurred while creating your order')
      setIsProcessing(false)
    }
  }

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
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
              Your Cart is Empty
            </h1>
            <p className="text-lg text-warm-gray font-light mb-8">
              Add some items to your cart before checkout
            </p>
            <Link
              href="/explore"
              className="inline-block bg-carbon text-white px-8 py-4 font-medium tracking-wider uppercase text-sm hover:bg-gray-800 transition-colors duration-200"
            >
              Continue Shopping
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
              href="/cart"
              className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Cart</span>
            </Link>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-light">
            Checkout
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Shipping Information */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-5 h-5 text-carbon" />
                  <h2 className="font-serif text-2xl font-light">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country *</label>
                    <select
                      required
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Spain">Spain</option>
                      <option value="Italy">Italy</option>
                      <option value="Peru">Peru</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State/Province *</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <CreditCard className="w-5 h-5 text-carbon" />
                  <h2 className="font-serif text-2xl font-light">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  {/* Stripe Option */}
                  <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-carbon transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
                      className="text-carbon"
                    />
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-carbon" />
                      <div>
                        <div className="font-medium">Credit Card</div>
                        <div className="text-sm text-gray-500">Secure payment via Stripe</div>
                      </div>
                    </div>
                  </label>

                  {/* Yape Option */}
                  <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-carbon transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="yape"
                      checked={paymentMethod === 'yape'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'yape')}
                      className="text-carbon"
                    />
                    <div className="flex items-center space-x-3">
                      <QrCode className="w-5 h-5 text-carbon" />
                      <div>
                        <div className="font-medium">Yape</div>
                        <div className="text-sm text-gray-500">Pay with Yape mobile wallet</div>
                      </div>
                    </div>
                  </label>

                  {/* Plin Option */}
                  <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-carbon transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="plin"
                      checked={paymentMethod === 'plin'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'plin')}
                      className="text-carbon"
                    />
                    <div className="flex items-center space-x-3">
                      <QrCode className="w-5 h-5 text-carbon" />
                      <div>
                        <div className="font-medium">Plin</div>
                        <div className="text-sm text-gray-500">Pay with Plin mobile wallet</div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Manual Payment Instructions */}
                {(paymentMethod === 'yape' || paymentMethod === 'plin') && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-4">Pay with {paymentMethod === 'yape' ? 'Yape' : 'Plin'}</h3>
                    
                    {/* QR Code */}
                    <div className="text-center mb-6">
                      <img
                        src={`/payment-qr/${paymentMethod}-qr.svg`}
                        alt={`${paymentMethod} QR Code`}
                        className="w-48 h-48 mx-auto border border-gray-200 rounded-lg"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Scan this QR code with your {paymentMethod === 'yape' ? 'Yape' : 'Plin'} app
                      </p>
                    </div>

                    {/* Phone Number */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Send payment to this number:
                      </label>
                      <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="font-mono">+51 999 888 777</span>
                      </div>
                    </div>

                    {/* Transaction Code */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Transaction Code or Payment Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={transactionCode}
                        onChange={(e) => setTransactionCode(e.target.value)}
                        placeholder="Enter transaction code or any notes"
                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                      />
                    </div>

                    {/* Payment Proof Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">
                        Upload Payment Proof (Optional)
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-carbon transition-colors">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="payment-proof"
                        />
                        <label htmlFor="payment-proof" className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <div className="text-sm text-gray-600">
                            {paymentProof ? (
                              <div>
                                <FileText className="w-4 h-4 inline mr-1" />
                                {paymentProof.name}
                              </div>
                            ) : (
                              <div>
                                Click to upload screenshot or PDF<br />
                                <span className="text-xs">JPG, PNG, or PDF (max 5MB)</span>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">Important:</p>
                          <p>After making the payment, please upload a screenshot of the transaction confirmation. Your order will be reviewed and confirmed once payment is verified.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stripe Payment Form */}
                {paymentMethod === 'stripe' && (
                  <div className="mt-6">
                    <div className="flex items-center space-x-2 mb-6 text-sm text-gray-600">
                      <Lock className="w-4 h-4" />
                      <span>Secure Checkout</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Card Number *</label>
                        <input
                          type="text"
                          required
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          value={formData.expiryDate}
                          onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV *</label>
                        <input
                          type="text"
                          required
                          placeholder="123"
                          value={formData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Cardholder Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.cardholderName}
                          onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-carbon text-white py-4 px-6 font-medium text-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : paymentMethod === 'stripe' ? 'Place Order' : 'Submit Order for Review'}
              </button>
            </motion.form>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-serif text-2xl font-light mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-light line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary Details */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-serif text-xl font-light">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Info */}
              {(paymentMethod === 'yape' || paymentMethod === 'plin') && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      {paymentMethod === 'yape' ? 'Yape' : 'Plin'} Payment
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Your order will be reviewed after payment confirmation
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 