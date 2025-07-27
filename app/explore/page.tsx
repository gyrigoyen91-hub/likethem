'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import CuratorGrid from '@/components/CuratorGrid'
import FilterSidebar from '@/components/FilterSidebar'
import SearchBar from '@/components/SearchBar'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Filter curators based on search query
    console.log('Searching for:', query)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container-custom py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Discover Curators
          </h1>
          <p className="text-lg text-warm-gray font-light mb-8">
            Explore curated stores by the content creators you admire
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar
              variant="page"
              placeholder="Search by curator, city, or style…"
              onSearch={handleSearch}
              className="mb-8"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar />
          <CuratorGrid searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  )
} 