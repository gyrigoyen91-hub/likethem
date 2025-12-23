'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Paperclip, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  image?: string
  timestamp: Date
}

interface NigelChatModalProps {
  isOpen: boolean
  onClose: () => void
  productData?: {
    name: string
    curator: string
    price: number
    image: string
    category?: string
  }
}

export default function NigelChatModal({ isOpen, onClose, productData }: NigelChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'ai',
        content: `Hello! I'm Nigel, your personal fashion stylist. I can help you with styling advice, fit questions, or finding similar pieces. What would you like to know about ${productData?.name || 'this piece'}?`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, messages.length, productData?.name])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploadedImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const simulateAIResponse = async (userMessage: string, hasImage: boolean) => {
    setIsTyping(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    let aiResponse = ''

    if (hasImage) {
      // Image-based response
      const responses = [
        "Based on your photo, I can see you're drawn to oversized silhouettes and neutral tones. This piece would work beautifully with high-waisted trousers and minimal accessories for a clean, editorial look.",
        "That's a great reference image! The relaxed fit and texture remind me of pieces from Marcus Chen's collection. You might also like our 'Minimalist Cotton Blazer' for a similar aesthetic.",
        "I love the styling in your photo! For a similar vibe, try pairing this with straight-leg jeans and a simple white tee. The key is keeping the rest of the outfit minimal to let this piece shine."
      ]
      aiResponse = responses[Math.floor(Math.random() * responses.length)]
    } else {
      // Text-based response
      const responses = [
        `This ${productData?.name} is incredibly versatile! I'd recommend pairing it with high-waisted trousers and sleek boots for a sophisticated look, or with jeans and sneakers for a more casual vibe.`,
        `The fit on this piece is designed to be relaxed and comfortable. For the best look, I suggest sizing down if you prefer a more fitted silhouette, or staying true to size for the intended oversized aesthetic.`,
        `This piece from ${productData?.curator} is perfect for layering. Try it over a simple turtleneck in winter, or with a lightweight blouse in spring. The neutral color makes it easy to style with any palette.`
      ]
      aiResponse = responses[Math.floor(Math.random() * responses.length)]
    }

    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, aiMessage])
    setIsTyping(false)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !uploadedImage) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      image: imagePreview || undefined,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    removeImage()
    setIsLoading(true)

    // Simulate AI response
    await simulateAIResponse(inputMessage, !!uploadedImage)
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const suggestedQuestions = [
    "How do I style this?",
    "Is this good for cold weather?",
    "What size should I get?",
    "What colors work with this?"
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-carbon text-white rounded-full flex items-center justify-center">
                  <span className="text-lg">🧠</span>
                </div>
                <div>
                  <h2 className="font-serif text-xl font-light">Nigel</h2>
                  <p className="text-sm text-gray-600">Your Personal Stylist</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-carbon text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.image && (
                      <div className="mb-3">
                        <img
                          src={message.image}
                          alt="Uploaded image"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Nigel is typing...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Image Preview */}
            {imagePreview && (
              <div className="px-6 pb-4">
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Nigel about styling, fit, or upload an image for inspiration..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-carbon"
                    rows={2}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-carbon transition-colors"
                    title="Upload image"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={(!inputMessage.trim() && !uploadedImage) || isLoading}
                    className="p-3 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Upload an image (max 5MB) for personalized styling advice
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 