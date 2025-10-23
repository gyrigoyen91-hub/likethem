'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import CTAButton from '@/components/ui/CTAButton'

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
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <CTAButton as="link" href="/explore" variant="primary" size="lg" className="tracking-[0.01em] md:tracking-normal">
              Discover Stores
            </CTAButton>

            <CTAButton as="link" href="/apply" variant="secondary" size="lg" className="tracking-[0.01em] md:tracking-normal">
              Apply to Sell
            </CTAButton>
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