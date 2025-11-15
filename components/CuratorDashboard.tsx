'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3, 
  ShoppingBag, 
  DollarSign, 
  Heart, 
  Users, 
  Settings, 
  Plus,
  Edit,
  Eye,
  TrendingUp,
  MessageCircle,
  Store,
  Package
} from 'lucide-react'
import Link from 'next/link'

interface DashboardMetric {
  label: string
  value: string | number
  change: string
  icon: React.ReactNode
  color: string
}

interface CuratorDashboardProps {
  curator: {
    name: string
    avatar: string
    storeName: string
    isEditorPick: boolean
  }
}

export default function CuratorDashboard({ curator }: CuratorDashboardProps) {
  const metrics: DashboardMetric[] = [
    {
      label: 'Store Visits',
      value: '2,847',
      change: '+12%',
      icon: <Eye className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Items Sold',
      value: '23',
      change: '+8%',
      icon: <ShoppingBag className="w-5 h-5" />,
      color: 'bg-green-50 text-green-600'
    },
    {
      label: 'Earnings',
      value: '$1,247',
      change: '+15%',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      label: 'Favorites',
      value: '156',
      change: '+23%',
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-red-50 text-red-600'
    }
  ]

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'Upload a new item to your store',
      icon: <Plus className="w-6 h-6" />,
      href: '/dashboard/curator/products/new',
      color: 'bg-carbon text-white hover:bg-gray-800'
    },
    {
      title: 'Edit Store Profile',
      description: 'Update your bio and store settings',
      icon: <Edit className="w-6 h-6" />,
      href: '/dashboard/curator/store',
      color: 'bg-gray-100 text-carbon hover:bg-gray-200'
    },
    {
      title: 'View Analytics',
      description: 'Check your performance insights',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/dashboard/curator/analytics',
      color: 'bg-gray-100 text-carbon hover:bg-gray-200'
    },
    {
      title: 'Manage Orders',
      description: 'View and fulfill customer orders',
      icon: <Package className="w-6 h-6" />,
      href: '/dashboard/curator/orders',
      color: 'bg-gray-100 text-carbon hover:bg-gray-200'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-light text-gray-900 mb-4">
                Curator Dashboard
              </h1>
              <p className="text-lg text-gray-600">
                Welcome back, {curator.name}. Here's what's happening with your store.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={curator.avatar}
                  alt={curator.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {curator.isEditorPick && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-white rounded-full p-1">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{curator.storeName}</h3>
                <p className="text-sm text-gray-500">Curator</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  {metric.icon}
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-green-600">{metric.change}</span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <Link href={action.href} className="block">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    {action.icon}
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">{action.title}</h3>
                </div>
                <p className="text-gray-600">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New order received</p>
                  <p className="text-sm text-gray-500">Order #1234 for "Vintage Leather Jacket"</p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Product favorited</p>
                  <p className="text-sm text-gray-500">"Minimalist Watch" was added to favorites</p>
                </div>
                <span className="text-sm text-gray-500">4 hours ago</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New review</p>
                  <p className="text-sm text-gray-500">5-star review for "Classic Denim Jacket"</p>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 