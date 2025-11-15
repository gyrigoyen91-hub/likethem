'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-4xl md:text-5xl font-light text-gray-900 mb-6">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            You don't have permission to access this page. This area is restricted to authorized users only.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg max-w-2xl mx-auto">
            <h3 className="font-medium text-gray-900 mb-2">Need Access?</h3>
            <p className="text-gray-600 mb-4">
              If you believe you should have access to this page, please contact support or sign in with the correct account.
            </p>
            <Link
              href="/auth/signin"
              className="text-carbon hover:underline font-medium"
            >
              Sign in with a different account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 