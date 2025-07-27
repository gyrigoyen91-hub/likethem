'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface CuratorGridProps {
  searchQuery?: string
}

const curators = [
  {
    id: 1,
    name: 'Sofia Laurent',
    tagline: 'Minimal Parisian',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    followers: '2.4M',
    location: 'Paris',
    isEditorPick: true
  },
  {
    id: 2,
    name: 'Marcus Chen',
    tagline: 'Tokyo Streetwear',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    followers: '1.8M',
    location: 'Tokyo',
    isEditorPick: false
  },
  {
    id: 3,
    name: 'Isabella Rossi',
    tagline: 'Italian Elegance',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    followers: '3.1M',
    location: 'Milan',
    isEditorPick: true
  },
  {
    id: 4,
    name: 'Alex Rivera',
    tagline: 'Vintage Vibes',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    followers: '950K',
    location: 'Los Angeles',
    isEditorPick: false
  },
  {
    id: 5,
    name: 'Emma Thompson',
    tagline: 'London Minimalist',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    followers: '1.2M',
    location: 'London',
    isEditorPick: false
  },
  {
    id: 6,
    name: 'Yuki Tanaka',
    tagline: 'Kyoto Traditional',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    followers: '680K',
    location: 'Kyoto',
    isEditorPick: false
  }
]

export default function CuratorGrid({ searchQuery = '' }: CuratorGridProps) {
  // Filter curators based on search query
  const filteredCurators = curators.filter(curator => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      curator.name.toLowerCase().includes(query) ||
      curator.tagline.toLowerCase().includes(query) ||
      curator.location.toLowerCase().includes(query)
    )
  })

  if (filteredCurators.length === 0) {
    return (
      <div className="flex-1">
        <div className="text-center py-16">
          <h3 className="font-serif text-xl font-light mb-2">No curators found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or browse all curators
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCurators.map((curator, index) => (
          <motion.div
            key={curator.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="group cursor-pointer"
          >
            <Link href={`/curator/${curator.id}`}>
              <div className="relative overflow-hidden bg-stone">
                <img
                  src={curator.image}
                  alt={curator.name}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {curator.isEditorPick && (
                  <div className="absolute top-4 left-4 bg-carbon text-white px-2 py-1 text-xs font-medium">
                    Editor's Pick
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>

              <div className="mt-4">
                <h3 className="font-serif text-xl font-light mb-1">
                  {curator.name}
                </h3>
                <p className="text-warm-gray text-sm font-light mb-2">
                  {curator.tagline}
                </p>
                <p className="text-warm-gray text-xs">
                  {curator.followers} followers • {curator.location}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 