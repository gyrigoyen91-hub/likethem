'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import ProductImageZoom from './ProductImageZoom'

export default function ZoomDemo() {
  const demoProduct = {
    name: 'Oversized Wool Coat',
    curator: 'Marcus Chen',
    price: 240,
    images: [
      {
        id: '1',
        src: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
        alt: 'Oversized Wool Coat - Front View',
        caption: 'Front view showing the relaxed silhouette'
      },
      {
        id: '2',
        src: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
        alt: 'Oversized Wool Coat - Detail View',
        caption: 'Close-up of the wool texture and construction'
      },
      {
        id: '3',
        src: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
        alt: 'Oversized Wool Coat - Styled Look',
        caption: 'Styled with minimal accessories for a clean look'
      }
    ]
  }

  return (
    <section className="py-24 bg-stone">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Experience Product Zoom
          </h2>
          <p className="text-lg text-warm-gray font-light max-w-2xl mx-auto">
            Hover over the image to zoom in, or click to open the full-screen look view. 
            Experience the luxury of detailed product exploration.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Product Image with Zoom */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <ProductImageZoom
              images={demoProduct.images}
              curator={demoProduct.curator}
              className="w-full h-96 md:h-[500px]"
            />
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div>
              <h3 className="font-serif text-2xl font-light mb-2">
                {demoProduct.name}
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                Curated by {demoProduct.curator}
              </p>
              <p className="font-serif text-xl font-light text-carbon">
                ${demoProduct.price.toFixed(2)}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-lg">Zoom Features:</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-carbon rounded-full"></span>
                  <span>Hover to zoom in (desktop only)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-carbon rounded-full"></span>
                  <span>Click to open full-screen look view</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-carbon rounded-full"></span>
                  <span>Navigate through multiple images</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-carbon rounded-full"></span>
                  <span>Keyboard navigation (arrow keys, ESC)</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/product/1"
                className="inline-block bg-carbon text-white px-8 py-4 font-medium tracking-wider uppercase text-sm hover:bg-gray-800 transition-colors duration-200"
              >
                View Full Product
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 