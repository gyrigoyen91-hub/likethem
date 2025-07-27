'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { useState } from 'react'

const curators = [
  {
    id: 1,
    name: 'Sofia Laurent',
    tagline: 'Minimal Parisian',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    followers: '2.4M',
    location: 'Based in Paris'
  },
  {
    id: 2,
    name: 'Marcus Chen',
    tagline: 'Tokyo Streetwear',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    followers: '1.8M',
    location: 'Based in Tokyo'
  },
  {
    id: 3,
    name: 'Isabella Rossi',
    tagline: 'Italian Elegance',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    followers: '3.1M',
    location: 'Based in Milan'
  },
  {
    id: 4,
    name: 'Alex Rivera',
    tagline: 'Vintage Vibes',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    followers: '950K',
    location: 'Based in Los Angeles'
  }
]

export default function FeaturedCurators() {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Featured Curators
          </h2>
          <p className="text-lg text-warm-gray max-w-2xl mx-auto font-light">
            Discover the most influential style curators in fashion
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {curators.map((curator, index) => (
            <CuratorCard key={curator.id} curator={curator} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/explore" className="inline-block border border-carbon text-carbon px-8 py-3 font-medium tracking-wider uppercase text-sm hover:bg-carbon hover:text-white transition-colors duration-200">
            View All Curators
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

function CuratorCard({ curator, index }: { curator: any; index: number }) {
  const [imageError, setImageError] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group cursor-pointer"
    >
      <Link href={`/curator/${curator.id}`}>
        <div className="relative overflow-hidden bg-stone h-80 md:h-[420px]">
          {!imageError ? (
            <img
              src={curator.image}
              alt={curator.name}
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Image unavailable</span>
            </div>
          )}
          
          {/* LikeThem Logo Overlay - Top Left */}
          <div className="absolute top-4 left-4 opacity-85">
            <span className="font-serif text-white text-sm font-light drop-shadow-lg">
              LikeThem
            </span>
          </div>
          
          {/* Hover Info Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 ease-out flex items-end">
            <div className="w-full p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif text-2xl font-light">
                  {curator.name}
                </h3>
                <a 
                  href={`https://instagram.com/${curator.name.toLowerCase().replace(' ', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-200 transition-colors duration-200"
                  title="View Instagram"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
              
              <p className="text-white/90 text-sm font-light mb-2">
                {curator.tagline}
              </p>
              
              <div className="flex items-center justify-between text-sm text-white/80">
                <span>{curator.followers} followers</span>
                <span>{curator.location}</span>
              </div>
              
              <div className="mt-4">
                <span className="text-white/70 text-xs uppercase tracking-wider">
                  View Store
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
} 