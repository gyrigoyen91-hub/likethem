'use client'

import { motion } from 'framer-motion'
import AskNigelButton from './AskNigelButton'

export default function NigelDemo() {
  const demoProduct = {
    name: 'Oversized Wool Coat',
    curator: 'Marcus Chen',
    price: 240,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
  }

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Meet Nigel, Your AI Stylist
          </h2>
          <p className="text-lg text-warm-gray font-light max-w-3xl mx-auto">
            Get personalized styling advice, fit recommendations, and discover similar pieces 
            with our AI-powered fashion concierge. Upload images for inspiration or ask questions 
            about any product.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Demo Product */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="font-serif text-2xl font-light mb-4">
                {demoProduct.name}
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                Curated by {demoProduct.curator}
              </p>
              <p className="font-serif text-xl font-light text-carbon mb-6">
                ${demoProduct.price.toFixed(2)}
              </p>
              
              <AskNigelButton
                productData={demoProduct}
                className="mt-6"
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-lg">What Nigel can help with:</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-carbon rounded-full"></span>
                  <span>Styling advice and outfit suggestions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-carbon rounded-full"></span>
                  <span>Fit recommendations and sizing guidance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-carbon rounded-full"></span>
                  <span>Finding similar pieces in our catalog</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-carbon rounded-full"></span>
                  <span>Image-based inspiration and recommendations</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-carbon text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🧠</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">AI-Powered Insights</h3>
                  <p className="text-gray-600">
                    Nigel analyzes product details, styling context, and your preferences to provide 
                    personalized fashion advice that matches your aesthetic.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-carbon text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📸</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Image Upload</h3>
                  <p className="text-gray-600">
                    Upload inspiration images and get recommendations for similar pieces, 
                    styling suggestions, and curator recommendations based on your reference.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-carbon text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Natural Conversation</h3>
                  <p className="text-gray-600">
                    Chat naturally with Nigel about styling, fit, weather appropriateness, 
                    or any fashion-related questions. Get instant, contextual responses.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-carbon text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">Curator Matching</h3>
                  <p className="text-gray-600">
                    Discover curators whose aesthetic matches your style preferences. 
                    Nigel connects you with the right influencers and their curated collections.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
} 