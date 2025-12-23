'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import NigelChatModal from './NigelChatModal'

interface AskNigelButtonProps {
  productData?: {
    name: string
    curator: string
    price: number
    image: string
    category?: string
  }
  className?: string
}

export default function AskNigelButton({ productData, className = '' }: AskNigelButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <motion.button
        onClick={handleOpenModal}
        className={`w-full py-3 px-4 border border-gray-300 text-carbon hover:border-carbon hover:text-carbon transition-all duration-200 font-medium ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-center space-x-2">
          <span className="text-lg">🧠</span>
          <span>Not sure about this piece? Ask Nigel.</span>
        </div>
      </motion.button>

      <NigelChatModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        productData={productData}
      />
    </>
  )
} 