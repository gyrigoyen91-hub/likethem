'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - High-end Editorial Style */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/banner-home.jpg"
          alt="LikeThem — Curated fashion by top influencers"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/15"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light mb-6 tracking-wide uppercase">
            From your feed to your closet.
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto font-light">
            Curated fashion by top influencers. Exclusive access to the pieces that matter.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/explore" className="inline-block bg-black text-white px-8 py-4 font-medium tracking-wider uppercase text-sm hover:bg-gray-800 transition-colors duration-200">
                Discover Stores
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/access" className="inline-block bg-white text-black border border-white px-8 py-4 font-medium tracking-wider uppercase text-sm hover:bg-gray-100 transition-colors duration-200">
                Apply to Sell
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </section>
  )
} 