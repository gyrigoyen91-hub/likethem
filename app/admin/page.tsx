import { getCurrentUser, requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, ShoppingBag, Store, BarChart3, Settings, Shield } from 'lucide-react'

// Force dynamic rendering to prevent build issues
export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const user = await getCurrentUser()
  
  try {
    requireRole(user, 'ADMIN')
  } catch (error) {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-light text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back, {user?.fullName || 'Admin'}. Manage your platform from here.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Curators</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">5,678</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$45.2K</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="ml-3 font-medium text-gray-900">User Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and permissions across the platform.
            </p>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Manage Users →
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="ml-3 font-medium text-gray-900">Curator Management</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Review and manage curator applications and store profiles.
            </p>
            <button className="text-green-600 hover:text-green-700 font-medium">
              Manage Curators →
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="ml-3 font-medium text-gray-900">Product Moderation</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Review and moderate products, handle reports and violations.
            </p>
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              Moderate Products →
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="ml-3 font-medium text-gray-900">Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View platform analytics, sales reports, and performance metrics.
            </p>
            <button className="text-orange-600 hover:text-orange-700 font-medium">
              View Analytics →
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="ml-3 font-medium text-gray-900">Security</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor security events, manage API keys, and review access logs.
            </p>
            <button className="text-red-600 hover:text-red-700 font-medium">
              Security Settings →
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="ml-3 font-medium text-gray-900">Platform Settings</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure platform settings, features, and system preferences.
            </p>
            <button className="text-gray-600 hover:text-gray-700 font-medium">
              Platform Settings →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 