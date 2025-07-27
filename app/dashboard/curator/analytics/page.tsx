'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  ShoppingBag,
  DollarSign,
  MapPin,
  Smartphone,
  Monitor,
  Calendar,
  Filter
} from 'lucide-react'

interface AnalyticsMetric {
  label: string
  value: string | number
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: React.ReactNode
}

interface TrafficData {
  date: string
  views: number
  favorites: number
  sales: number
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'favorites' | 'sales'>('views')

  const metrics: AnalyticsMetric[] = [
    {
      label: 'Total Store Visits',
      value: '12,847',
      change: '+23%',
      trend: 'up',
      icon: <Eye className="w-5 h-5" />
    },
    {
      label: 'Items Favorited',
      value: '1,234',
      change: '+18%',
      trend: 'up',
      icon: <Heart className="w-5 h-5" />
    },
    {
      label: 'Products Sold',
      value: '89',
      change: '+12%',
      trend: 'up',
      icon: <ShoppingBag className="w-5 h-5" />
    },
    {
      label: 'Total Revenue',
      value: '$8,247',
      change: '+15%',
      trend: 'up',
      icon: <DollarSign className="w-5 h-5" />
    }
  ]

  const topProducts = [
    {
      name: 'Oversized Wool Coat',
      views: 156,
      favorites: 23,
      sales: 3,
      revenue: 720
    },
    {
      name: 'Minimalist Cotton Blazer',
      views: 89,
      favorites: 12,
      sales: 1,
      revenue: 180
    },
    {
      name: 'Relaxed Linen Shirt',
      views: 67,
      favorites: 8,
      sales: 0,
      revenue: 0
    }
  ]

  const demographics = {
    cities: [
      { city: 'New York', percentage: 28 },
      { city: 'Los Angeles', percentage: 22 },
      { city: 'Chicago', percentage: 15 },
      { city: 'Miami', percentage: 12 },
      { city: 'Other', percentage: 23 }
    ],
    devices: [
      { device: 'Mobile', percentage: 65 },
      { device: 'Desktop', percentage: 30 },
      { device: 'Tablet', percentage: 5 }
    ]
  }

  const trafficData: TrafficData[] = [
    { date: 'Jan 1', views: 120, favorites: 18, sales: 2 },
    { date: 'Jan 2', views: 145, favorites: 22, sales: 1 },
    { date: 'Jan 3', views: 98, favorites: 15, sales: 0 },
    { date: 'Jan 4', views: 167, favorites: 28, sales: 3 },
    { date: 'Jan 5', views: 134, favorites: 21, sales: 2 },
    { date: 'Jan 6', views: 189, favorites: 32, sales: 4 },
    { date: 'Jan 7', views: 156, favorites: 25, sales: 2 }
  ]

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />
      case 'down':
        return <TrendingUp className="w-4 h-4 transform rotate-180" />
      default:
        return <div className="w-4 h-4" />
    }
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
            <div>
              <h1 className="font-serif text-3xl font-light mb-2">Analytics</h1>
              <p className="text-gray-600">
                Track your store performance and audience insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {metric.icon}
                </div>
                <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)}
                  <span className="text-sm font-medium">{metric.change}</span>
                </div>
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
          {/* Traffic Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-light">Traffic Overview</h2>
                <div className="flex space-x-2">
                  {(['views', 'favorites', 'sales'] as const).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedMetric === metric
                          ? 'bg-carbon text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Simple Chart */}
              <div className="h-64 flex items-end justify-between space-x-2">
                {trafficData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-carbon rounded-t"
                      style={{
                        height: `${(data[selectedMetric] / Math.max(...trafficData.map(d => d[selectedMetric]))) * 200}px`
                      }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{data.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">Top Products</h2>
              
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-carbon line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{product.views} views</span>
                        <span>{product.favorites} fav</span>
                        <span>{product.sales} sales</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-carbon">
                        ${product.revenue}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Demographics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MapPin className="w-5 h-5 text-carbon" />
                <h2 className="font-serif text-xl font-light">Top Cities</h2>
              </div>
              
              <div className="space-y-4">
                {demographics.cities.map((city, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{city.city}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-carbon h-2 rounded-full"
                          style={{ width: `${city.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-carbon w-8 text-right">
                        {city.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Smartphone className="w-5 h-5 text-carbon" />
                <h2 className="font-serif text-xl font-light">Device Usage</h2>
              </div>
              
              <div className="space-y-4">
                {demographics.devices.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {device.device === 'Mobile' && <Smartphone className="w-4 h-4 text-gray-400" />}
                      {device.device === 'Desktop' && <Monitor className="w-4 h-4 text-gray-400" />}
                      {device.device === 'Tablet' && <Smartphone className="w-4 h-4 text-gray-400" />}
                      <span className="text-sm text-gray-700">{device.device}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-carbon h-2 rounded-full"
                          style={{ width: `${device.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-carbon w-8 text-right">
                        {device.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="font-serif text-xl font-light mb-6">Conversion Funnel</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-carbon mb-1">Store Visits</h3>
                <p className="text-2xl font-semibold text-carbon">12,847</p>
                <p className="text-sm text-gray-500">100%</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-medium text-carbon mb-1">Favorites</h3>
                <p className="text-2xl font-semibold text-carbon">1,234</p>
                <p className="text-sm text-gray-500">9.6%</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-carbon mb-1">Sales</h3>
                <p className="text-2xl font-semibold text-carbon">89</p>
                <p className="text-sm text-gray-500">0.7%</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-carbon mb-1">Revenue</h3>
                <p className="text-2xl font-semibold text-carbon">$8,247</p>
                <p className="text-sm text-gray-500">$92.66 avg</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 