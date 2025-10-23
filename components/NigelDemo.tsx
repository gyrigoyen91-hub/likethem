'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Image from 'next/image'
import AskNigelButton from './AskNigelButton'

export default function NigelDemo() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  const demoProduct = {
    name: 'Oversized Wool Coat',
    curator: 'Marcus Chen',
    price: 320,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  }

  const features = [
    {
      title: "Smart Recommendations",
      description: "Analyzes your preferences and visual patterns to curate what suits you."
    },
    {
      title: "Style Context", 
      description: "Understands the story behind each look — materials, cuts, and fit."
    },
    {
      title: "Adaptive Learning",
      description: "Learns your aesthetic from every interaction, refining its taste."
    }
  ]

  return (
    <section className="max-w-6xl mx-auto py-24 px-6 md:px-10 bg-white">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left column: text + features */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-serif font-light text-zinc-900">
              Meet Nigel.
            </h2>
            <p className="text-zinc-600 text-lg leading-relaxed">
              Your intelligent style companion. Nigel helps you discover, analyze, and refine your personal aesthetic.
            </p>
          </div>

          {/* Interactive Feature List */}
          <motion.ul className="space-y-4 md:space-y-2">
            {features.map((feature, i) => (
              <motion.li
                key={i}
                className="cursor-pointer"
                onHoverStart={() => setActiveFeature(i)}
                onHoverEnd={() => setActiveFeature(null)}
              >
                <div className="text-lg font-medium text-zinc-900 hover:text-black transition-colors duration-200">
                  {feature.title}
                </div>
                <AnimatePresence>
                  {activeFeature === i && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="text-sm text-zinc-500 mt-1 leading-relaxed"
                    >
                      {feature.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Right column: product preview */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative group w-full max-w-sm">
            <div className="relative overflow-hidden rounded-xl shadow-sm border border-zinc-200/60 bg-white">
              <Image
                src={demoProduct.image}
                alt="Nigel product preview"
                width={400}
                height={500}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
              
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Product info overlay */}
              <div className="absolute bottom-4 left-4 text-white">
                <h4 className="text-lg font-semibold tracking-tight mb-1">
                  {demoProduct.name}
                </h4>
                <p className="text-sm opacity-90 mb-2">
                  Curated by {demoProduct.curator}
                </p>
                <p className="text-lg font-medium">
                  ${demoProduct.price}
                </p>
              </div>
            </div>
            
            {/* Ask Nigel Button */}
            <div className="mt-4 flex justify-center">
              <AskNigelButton
                productData={demoProduct}
                className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors duration-200"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
} 