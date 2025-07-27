'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImage {
  id: string
  src: string
  alt: string
  caption?: string
}

interface ProductImageZoomProps {
  images: ProductImage[]
  curator?: string
  className?: string
}

export default function ProductImageZoom({ images, curator, className = '' }: ProductImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [showLookView, setShowLookView] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setZoomPosition({ x, y })
  }

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsZoomed(true)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsZoomed(false)
    }
  }

  const handleImageClick = () => {
    setShowLookView(true)
  }

  const handleCloseLookView = () => {
    setShowLookView(false)
  }

  const handlePreviousImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showLookView) return

    switch (e.key) {
      case 'Escape':
        handleCloseLookView()
        break
      case 'ArrowLeft':
        handlePreviousImage()
        break
      case 'ArrowRight':
        handleNextImage()
        break
    }
  }

  useEffect(() => {
    if (showLookView) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showLookView])

  const currentImage = images[currentImageIndex]

  return (
    <>
      {/* Main Product Image with Zoom */}
      <div
        ref={imageRef}
        className={`relative overflow-hidden bg-gray-100 rounded-lg cursor-zoom-in ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleImageClick}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isZoomed && !isMobile ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed && !isMobile
              ? {
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  transform: 'scale(1.5)'
                }
              : {}
          }
        />

        {/* Zoom Indicator (Desktop Only) */}
        {!isMobile && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-full flex items-center space-x-2">
              <ZoomIn className="w-4 h-4" />
              <span className="text-sm">Click to view</span>
            </div>
          </div>
        )}

        {/* Image Counter (if multiple images) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Caption */}
        {currentImage.caption && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
            <p className="text-sm font-light">{currentImage.caption}</p>
          </div>
        )}
      </div>

      {/* Look View Modal */}
      <AnimatePresence>
        {showLookView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
            onClick={handleCloseLookView}
          >
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close Button */}
              <button
                onClick={handleCloseLookView}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePreviousImage()
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextImage()
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}

              {/* Main Image */}
              <div
                className="relative max-w-full max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={currentImage.src}
                  alt={currentImage.alt}
                  className="max-w-full max-h-full object-contain"
                />

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                  <div className="text-white">
                    {curator && (
                      <p className="font-serif text-lg font-light mb-2">
                        Styled by {curator}
                      </p>
                    )}
                    {currentImage.caption && (
                      <p className="text-sm text-gray-300 font-light">
                        {currentImage.caption}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Shop the Look Button (Optional) */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle shop the look functionality
                  console.log('Shop the look clicked')
                }}
                className="absolute top-4 left-4 bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
              >
                Shop the Look
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 