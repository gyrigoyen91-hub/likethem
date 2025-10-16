'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Share2, Heart, Filter, Grid, List } from 'lucide-react'
import ProductCard from '@/components/ProductCard'

// Clothing category icons and data
const clothingCategories = [
  { name: 'Dresses', icon: '👗', count: 12, color: 'bg-pink-100 text-pink-800' },
  { name: 'Jackets', icon: '🧥', count: 8, color: 'bg-blue-100 text-blue-800' },
  { name: 'Pants', icon: '👖', count: 15, color: 'bg-green-100 text-green-800' },
  { name: 'Shoes', icon: '👠', count: 20, color: 'bg-purple-100 text-purple-800' },
  { name: 'Bags', icon: '👜', count: 6, color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Accessories', icon: '🕶', count: 10, color: 'bg-gray-100 text-gray-800' },
  { name: 'Jewelry', icon: '💍', count: 14, color: 'bg-red-100 text-red-800' },
  { name: 'Activewear', icon: '🏋️‍♀️', count: 7, color: 'bg-orange-100 text-orange-800' }
]

// Mock closet data
const closetData = {
  'tokyo-streetwear': {
    name: 'Marcus Chen',
    tagline: 'Tokyo Streetwear',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    followers: '1.8M',
    location: 'Tokyo',
    bio: 'Marcus Chen is a Tokyo-based fashion curator known for his minimalist approach to streetwear. His aesthetic combines the precision of Japanese design with the effortless cool of urban style.',
    isEditorPick: true,
    categories: ['Jackets', 'Pants', 'Shoes', 'Accessories']
  },
  'sofia-laurent': {
    name: 'Sofia Laurent',
    tagline: 'Minimal Parisian',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    followers: '2.4M',
    location: 'Paris',
    bio: 'Sofia Laurent embodies the effortless elegance of Parisian style. Her closet is a curated collection of timeless pieces that define modern minimalism.',
    isEditorPick: true,
    categories: ['Dresses', 'Jackets', 'Bags', 'Shoes']
  }
}

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: 'Oversized Wool Coat',
    price: 240,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    category: 'Jackets',
    section: 'Editor\'s Picks',
    isNew: false,
    brand: 'COS',
    size: 'M',
    condition: 'Like New',
    slug: 'oversized-wool-coat'
  },
  {
    id: 2,
    name: 'Minimalist Cotton Blazer',
    price: 289,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    category: 'Jackets',
    section: 'Statement Pieces',
    isNew: true,
    brand: 'Uniqlo',
    size: 'L',
    condition: 'New',
    slug: 'minimalist-cotton-blazer'
  },
  {
    id: 3,
    name: 'Silk Evening Dress',
    price: 420,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'Dresses',
    section: 'Most Worn',
    isNew: false,
    brand: 'Zara',
    size: 'S',
    condition: 'Used with Love',
    slug: 'silk-evening-dress'
  },
  {
    id: 4,
    name: 'Leather Ankle Boots',
    price: 180,
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    category: 'Shoes',
    section: 'Editor\'s Picks',
    isNew: false,
    brand: 'Dr. Martens',
    size: '8',
    condition: 'Like New',
    slug: 'leather-ankle-boots'
  },
  {
    id: 5,
    name: 'Minimalist Handbag',
    price: 300,
    image: 'https://images.unsplash.com/photo-1566973890805-89f77278f03a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    category: 'Bags',
    section: 'Statement Pieces',
    isNew: true,
    brand: 'Celine',
    size: 'One Size',
    condition: 'New',
    slug: 'minimalist-handbag'
  }
]

interface ClosetPageProps {
  params: {
    slug: string
  }
}

export default function ClosetPage({ params }: ClosetPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const closet = closetData[params.slug as keyof typeof closetData]
  
  if (!closet) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-light mb-4">Closet not found</h1>
          <Link href="/explore" className="text-carbon hover:text-black transition-colors">
            ← Back to Explore
          </Link>
        </div>
      </div>
    )
  }

  const filteredProducts = selectedCategory 
    ? mockProducts.filter(product => product.category === selectedCategory)
    : mockProducts

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="container-custom max-w-7xl relative z-10">
          <div className="flex items-center justify-between py-6">
            <Link 
              href="/explore" 
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Explore</span>
            </Link>
            <button className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
          
          <div className="flex items-end gap-6 pb-8">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={closet.image} 
                  alt={closet.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {closet.isEditorPick && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  Editor's Pick
                </div>
              )}
            </div>
            
            <div className="flex-1 text-white">
              <h1 className="font-serif text-3xl md:text-4xl font-light mb-2">
                {closet.name}'s Closet
              </h1>
              <p className="text-lg opacity-90 mb-4">by {closet.name}</p>
              <p className="text-lg opacity-90 max-w-2xl mb-4">
                {closet.bio}
              </p>
              <div className="flex items-center gap-4 text-sm opacity-80">
                <span>{closet.followers} followers</span>
                <span>•</span>
                <span>{closet.location}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${closet.image})`,
            filter: 'brightness(0.4)'
          }}
        />
      </div>

      {/* Category Filters - Airbnb Style */}
      <div className="container-custom max-w-7xl py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-light">What's in this closet?</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {clothingCategories.map((category) => (
            <motion.button
              key={category.name}
              onClick={() => setSelectedCategory(
                selectedCategory === category.name ? null : category.name
              )}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedCategory === category.name
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl mb-2">{category.icon}</div>
              <div className="text-sm font-medium">{category.name}</div>
              <div className="text-xs opacity-60">{category.count} items</div>
            </motion.button>
          ))}
        </div>

        {/* Closet Sections */}
        <div className="space-y-12">
          {/* Editor's Picks */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-light">Editor's Picks</h3>
              <span className="text-sm text-gray-500">
                {mockProducts.filter(p => p.section === 'Editor\'s Picks').length} items
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts
                .filter(product => product.section === 'Editor\'s Picks')
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    imageUrl={product.image}
                    name={product.name}
                    brand={product.brand}
                    size={product.size}
                    condition={product.condition}
                    price={String(product.price)}
                    tag={product.isNew ? "New" : undefined}
                    curator={closet.name}
                    slug={product.slug}
                  />
                ))}
            </div>
          </section>

          {/* Statement Pieces */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-light">Statement Pieces</h3>
              <span className="text-sm text-gray-500">
                {mockProducts.filter(p => p.section === 'Statement Pieces').length} items
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts
                .filter(product => product.section === 'Statement Pieces')
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    imageUrl={product.image}
                    name={product.name}
                    brand={product.brand}
                    size={product.size}
                    condition={product.condition}
                    price={String(product.price)}
                    tag={product.isNew ? "New" : undefined}
                    curator={closet.name}
                    slug={product.slug}
                  />
                ))}
            </div>
          </section>

          {/* Most Worn */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-light">Most Worn</h3>
              <span className="text-sm text-gray-500">
                {mockProducts.filter(p => p.section === 'Most Worn').length} items
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts
                .filter(product => product.section === 'Most Worn')
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    imageUrl={product.image}
                    name={product.name}
                    brand={product.brand}
                    size={product.size}
                    condition={product.condition}
                    price={String(product.price)}
                    tag={product.isNew ? "New" : undefined}
                    curator={closet.name}
                    slug={product.slug}
                  />
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
