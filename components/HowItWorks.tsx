'use client'

import { motion } from 'framer-motion'
import { Search, ShoppingBag, Star } from 'lucide-react'

const steps = [
  {
    icon: Search,
    title: 'Find Your Favorite Influencer',
    description: 'Explore curated stores by the content creators you admire'
  },
  {
    icon: ShoppingBag,
    title: 'Shop What They Wear',
    description: 'Discover the exact pieces they wear in their most iconic looks'
  },
  {
    icon: Star,
    title: 'Wear It Like Them',
    description: 'Recreate their style with the same pieces that define their aesthetic'
  }
]

export default function HowItWorks() {
  return (
    <section className="py-24 bg-stone">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            How It Works
          </h2>
          <p className="text-lg text-warm-gray max-w-2xl mx-auto font-light">
            Three simple steps to dress like the ones you admire
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-carbon text-white rounded-full flex items-center justify-center">
                <step.icon className="w-8 h-8" />
              </div>
              
              <h3 className="font-serif text-2xl font-light mb-4">
                {step.title}
              </h3>
              
              <p className="text-warm-gray text-base leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 