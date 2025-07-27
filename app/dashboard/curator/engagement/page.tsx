'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Eye, 
  Share2, 
  Heart, 
  TrendingUp, 
  TrendingDown,
  ArrowLeft,
  BarChart3,
  Activity,
  MessageCircle,
  Star,
  Target,
  Zap
} from 'lucide-react'
import Link from 'next/link'

interface EngagementMetric {
  label: string
  value: string | number
  change: string
  changeType: 'increase' | 'decrease'
  icon: React.ReactNode
  color: string
  description: string
}

interface TrafficData {
  date: string
  store: number
  profile: number
  products: number
}

interface TopProduct {
  name: string
  favorites: number
  views: number
  conversionRate: number
  status: 'active' | 'inactive'
}

interface Referrer {
  source: string
  sessions: number
  percentage: number
}

export default function EngagementPage() {
  const [selectedMetric, setSelectedMetric] = useState<'store' | 'profile' | 'products'>('store')

  // Key Metrics Data
  const metrics: EngagementMetric[] = [
    {
      label: 'Profile Views',
      value: '1,254',
      change: '+12%',
      changeType: 'increase',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-50 text-blue-600',
      description: 'Total visits to your curator profile'
    },
    {
      label: 'Store Visits',
      value: '2,847',
      change: '+8%',
      changeType: 'increase',
      icon: <Eye className="w-5 h-5" />,
      color: 'bg-green-50 text-green-600',
      description: 'Total traffic to your storefront'
    },
    {
      label: 'Product Shares',
      value: '423',
      change: '+6%',
      changeType: 'increase',
      icon: <Share2 className="w-5 h-5" />,
      color: 'bg-purple-50 text-purple-600',
      description: 'Times products were shared (copy link, social, etc.)'
    },
    {
      label: 'Favorites',
      value: '156',
      change: '+23%',
      changeType: 'increase',
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-red-50 text-red-600',
      description: 'How many total times your items were favorited'
    }
  ]

  // Traffic Data for Chart
  const trafficData: TrafficData[] = [
    { date: 'Jan 1', store: 45, profile: 23, products: 67 },
    { date: 'Jan 2', store: 52, profile: 28, products: 74 },
    { date: 'Jan 3', store: 48, profile: 25, products: 71 },
    { date: 'Jan 4', store: 61, profile: 32, products: 89 },
    { date: 'Jan 5', store: 55, profile: 29, products: 82 },
    { date: 'Jan 6', store: 67, profile: 35, products: 95 },
    { date: 'Jan 7', store: 58, profile: 31, products: 87 },
    { date: 'Jan 8', store: 72, profile: 38, products: 103 },
    { date: 'Jan 9', store: 65, profile: 34, products: 91 },
    { date: 'Jan 10', store: 78, profile: 41, products: 112 },
    { date: 'Jan 11', store: 69, profile: 36, products: 98 },
    { date: 'Jan 12', store: 83, profile: 44, products: 118 },
    { date: 'Jan 13', store: 74, profile: 39, products: 105 },
    { date: 'Jan 14', store: 89, profile: 47, products: 125 },
    { date: 'Jan 15', store: 81, profile: 43, products: 115 },
    { date: 'Jan 16', store: 95, profile: 50, products: 132 },
    { date: 'Jan 17', store: 87, profile: 46, products: 123 },
    { date: 'Jan 18', store: 102, profile: 54, products: 141 },
    { date: 'Jan 19', store: 93, profile: 49, products: 130 },
    { date: 'Jan 20', store: 108, profile: 57, products: 148 },
    { date: 'Jan 21', store: 99, profile: 52, products: 137 },
    { date: 'Jan 22', store: 115, profile: 61, products: 156 },
    { date: 'Jan 23', store: 106, profile: 56, products: 145 },
    { date: 'Jan 24', store: 121, profile: 64, products: 163 },
    { date: 'Jan 25', store: 112, profile: 59, products: 152 },
    { date: 'Jan 26', store: 128, profile: 68, products: 171 },
    { date: 'Jan 27', store: 119, profile: 63, products: 160 },
    { date: 'Jan 28', store: 135, profile: 71, products: 178 },
    { date: 'Jan 29', store: 126, profile: 66, products: 167 },
    { date: 'Jan 30', store: 142, profile: 75, products: 185 }
  ]

  // Top Products by Favorites
  const topProducts: TopProduct[] = [
    {
      name: 'Minimalist Cotton Blazer',
      favorites: 12,
      views: 89,
      conversionRate: 13.5,
      status: 'active'
    },
    {
      name: 'Oversized Wool Coat',
      favorites: 23,
      views: 156,
      conversionRate: 14.7,
      status: 'active'
    },
    {
      name: 'Relaxed Linen Shirt',
      favorites: 8,
      views: 67,
      conversionRate: 11.9,
      status: 'inactive'
    },
    {
      name: 'Vintage Denim Jacket',
      favorites: 15,
      views: 98,
      conversionRate: 15.3,
      status: 'active'
    },
    {
      name: 'Silk Evening Dress',
      favorites: 6,
      views: 45,
      conversionRate: 13.3,
      status: 'active'
    }
  ]

  // Top Referrers
  const topReferrers: Referrer[] = [
    { source: 'Instagram', sessions: 1034, percentage: 36 },
    { source: 'Direct', sessions: 670, percentage: 24 },
    { source: 'TikTok', sessions: 503, percentage: 18 },
    { source: 'Google', sessions: 312, percentage: 11 },
    { source: 'Twitter', sessions: 234, percentage: 8 },
    { source: 'Other', sessions: 89, percentage: 3 }
  ]

  const getCurrentMetricData = () => {
    return trafficData.map(item => ({
      date: item.date,
      value: item[selectedMetric]
    }))
  }

  const getTrendColor = (changeType: 'increase' | 'decrease') => {
    return changeType === 'increase' ? 'text-green-600' : 'text-red-600'
  }

  const getTrendIcon = (changeType: 'increase' | 'decrease') => {
    return changeType === 'increase' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />
  }

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
              <Link
                href="/dashboard/curator"
                className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-6">
            <h1 className="font-serif text-3xl font-light mb-2">Engagement Insights</h1>
            <p className="text-gray-600">
              See how your audience is connecting with your store
            </p>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.color}`}>
                  {metric.icon}
                </div>
                <div className={`flex items-center space-x-1 ${getTrendColor(metric.changeType)}`}>
                  {getTrendIcon(metric.changeType)}
                  <span className="text-sm font-medium">{metric.change}</span>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-semibold text-carbon mb-1">
                  {metric.value}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {metric.label}
                </p>
                <p className="text-xs text-gray-500">
                  {metric.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Behavior Section - Traffic Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-light">Store Visit Trends</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedMetric('store')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedMetric === 'store'
                        ? 'bg-carbon text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Store
                  </button>
                  <button
                    onClick={() => setSelectedMetric('profile')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedMetric === 'profile'
                        ? 'bg-carbon text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setSelectedMetric('products')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedMetric === 'products'
                        ? 'bg-carbon text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Product Pages
                  </button>
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Visits (Past 30 Days)
                  </p>
                  <p className="text-sm text-gray-500">
                    Chart visualization would show here
                  </p>
                  <div className="mt-4 space-y-2">
                    {getCurrentMetricData().slice(-7).map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{item.date}</span>
                        <span className="font-medium">{item.value} visits</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Top Referrers */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">Top Referrers</h2>
              <p className="text-sm text-gray-600 mb-4">Where your traffic is coming from</p>
              
              <div className="space-y-4">
                {topReferrers.map((referrer, index) => (
                  <div key={referrer.source} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {referrer.source.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-carbon">{referrer.source}</p>
                        <p className="text-sm text-gray-600">{referrer.sessions.toLocaleString()} sessions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-carbon">{referrer.percentage}%</p>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-carbon rounded-full"
                          style={{ width: `${referrer.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 mt-4 italic">
                Use mock data. Make it expandable later when integrated with analytics.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Favorites Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="font-serif text-xl font-light mb-6">Favorites Breakdown</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product Name</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900"># of Favorites</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900"># of Views</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Conversion Rate</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-carbon">{product.name}</p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="font-medium">{product.favorites}</p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-gray-600">{product.views}</p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="font-medium text-green-600">{product.conversionRate}%</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            product.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          {product.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Feedback Highlights - Future Ready */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                💬 Feature coming soon:
              </h3>
              <p className="text-gray-600 mb-4">
                See customer feedback on your product picks.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Product Reviews</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4" />
                  <span>Style Feedback</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>Quick Insights</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 