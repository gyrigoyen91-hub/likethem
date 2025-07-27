import { getCurrentUser, requireRole } from '@/lib/auth'
import { redirect } from 'next/navigation'
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

export default async function CuratorDashboard() {
  const user = await getCurrentUser()
  
  try {
    requireRole(user, 'CURATOR')
  } catch (error) {
    redirect('/unauthorized')
  }

  const curator = {
    name: user?.fullName || 'Curator',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    storeName: user?.storeName || 'My Store',
    isEditorPick: user?.isEditorsPick || false
  }

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

  const recentProducts = [
    {
      id: '1',
      name: 'Oversized Wool Coat',
      price: 240,
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      views: 156,
      favorites: 23,
      status: 'active'
    },
    {
      id: '2',
      name: 'Minimalist Cotton Blazer',
      price: 180,
      image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      views: 89,
      favorites: 12,
      status: 'active'
    },
    {
      id: '3',
      name: 'Relaxed Linen Shirt',
      price: 95,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      views: 67,
      favorites: 8,
      status: 'inactive'
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
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={curator.avatar}
                alt={curator.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h1 className="font-serif text-3xl font-light">
                  Welcome back, {curator.name.split(' ')[0]}.
                </h1>
                <p className="text-lg text-gray-600">
                  Ready to inspire today?
                </p>
                {curator.isEditorPick && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                    ✨ Editor's Pick
                  </span>
                )}
              </div>
            </div>
            <Link
              href="/curator/isabella"
              className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>View My Store</span>
            </Link>
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
            <div
              key={metric.label}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  {metric.icon}
                </div>
                <span className="text-sm font-medium text-green-600">
                  {metric.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-carbon mb-1">
                  {metric.value}
                </p>
                <p className="text-sm text-gray-600">
                  {metric.label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">Quick Actions</h2>
              <div className="space-y-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className={`block p-4 rounded-lg transition-all duration-200 ${action.color}`}
                  >
                    <div className="flex items-center space-x-3">
                      {action.icon}
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm opacity-80">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Products */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-light">Recent Products</h2>
                <Link
                  href="/dashboard/curator/products"
                  className="text-sm text-carbon hover:text-black transition-colors"
                >
                  View All →
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-carbon">{product.name}</h3>
                      <p className="text-sm text-gray-600">${product.price}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {product.views} views
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.favorites} favorites
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/dashboard/curator/products/${product.id}/edit`}
                        className="p-2 text-gray-400 hover:text-carbon transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/product/${product.id}`}
                        className="p-2 text-gray-400 hover:text-carbon transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Menu */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="font-serif text-xl font-light mb-6">Dashboard Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/dashboard/curator/store"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Store className="w-5 h-5 text-carbon" />
                <span className="font-medium">My Store</span>
              </Link>
              
              <Link
                href="/dashboard/curator/products"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-carbon" />
                <span className="font-medium">My Products</span>
              </Link>
              
              <Link
                href="/dashboard/curator/analytics"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-5 h-5 text-carbon" />
                <span className="font-medium">Analytics</span>
              </Link>
              
              <Link
                href="/dashboard/curator/orders"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Package className="w-5 h-5 text-carbon" />
                <span className="font-medium">Orders</span>
              </Link>
              
              <Link
                href="/dashboard/curator/engagement"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 text-carbon" />
                <span className="font-medium">Engagement</span>
              </Link>
              
              <Link
                href="/dashboard/curator/ask-nigel"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-carbon" />
                <span className="font-medium">Ask Nigel</span>
              </Link>
              
              <Link
                href="/dashboard/curator/collaborations"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TrendingUp className="w-5 h-5 text-carbon" />
                <span className="font-medium">Collaborations</span>
              </Link>
              
              <Link
                href="/dashboard/curator/settings"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-5 h-5 text-carbon" />
                <span className="font-medium">Settings</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 