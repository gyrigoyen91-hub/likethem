'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Paperclip, 
  Image, 
  Loader2, 
  Brain,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  Target,
  MessageCircle,
  X,
  Check
} from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  image?: string
  isTyping?: boolean
}

interface SuggestedProduct {
  id: string
  name: string
  curator: string
  price: number
  image: string
  similarity: number
}

const suggestedQuestions = [
  "How can I increase product views?",
  "Which products should I promote more?",
  "What's trending in my store?",
  "Which of my products is underperforming and why?",
  "Can you suggest styling tips I can add to my product descriptions?",
  "What's my most favorited product this month?",
  "Suggest hashtags I should use when posting this item on social media."
]

const mockProducts: SuggestedProduct[] = [
  {
    id: '1',
    name: 'Oversized Wool Coat',
    curator: 'Sofia Laurent',
    price: 240,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    similarity: 95
  },
  {
    id: '2',
    name: 'Minimalist Cotton Blazer',
    curator: 'Alex Rivera',
    price: 180,
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    similarity: 87
  },
  {
    id: '3',
    name: 'Relaxed Linen Shirt',
    curator: 'Emma Thompson',
    price: 95,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    similarity: 78
  }
]

export default function AskNigelPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm Nigel, your personal AI assistant. I'm here to help you grow your curator store and make better decisions about your products. What would you like to know today?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      alert('Please upload a JPG, PNG, or WebP file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      setShowImagePreview(true)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setUploadedImage(null)
    setShowImagePreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const simulateAIResponse = async (userMessage: string, hasImage: boolean = false) => {
    setIsLoading(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000))

    let aiResponse = ""

    if (hasImage) {
      aiResponse = `I found some similar pieces to what you've shown me! Here are some recommendations from our curator stores:

${mockProducts.map(product => `
**${product.name}** by ${product.curator}
- Price: $${product.price}
- Similarity: ${product.similarity}%
- [View Product](/product/${product.id})

`).join('')}

These pieces share similar styling elements with your reference image. Would you like me to suggest more specific styling tips or help you find similar items in your own collection?`
    } else {
      // Contextual responses based on user input
      const lowerMessage = userMessage.toLowerCase()
      
      if (lowerMessage.includes('view') || lowerMessage.includes('traffic')) {
        aiResponse = `Great question! Here are some strategies to increase your product views:

**📈 Quick Wins:**
- Update your product photos with lifestyle shots
- Add detailed descriptions with styling tips
- Use trending hashtags in your product tags

**🎯 Long-term Strategy:**
- Post consistently on your social media
- Collaborate with other curators
- Engage with your audience through comments

**📊 Your Current Performance:**
Based on your analytics, your "Oversized Wool Coat" is getting the most views (156 this month). Consider promoting similar pieces!`
      } else if (lowerMessage.includes('promote') || lowerMessage.includes('trending')) {
        aiResponse = `Based on your store data, here are the products you should focus on:

**🔥 Top Performers:**
1. **Oversized Wool Coat** - 156 views, 23 favorites
2. **Minimalist Cotton Blazer** - 89 views, 12 favorites
3. **Relaxed Linen Shirt** - 67 views, 8 favorites

**💡 Promotion Tips:**
- Create "Shop the Look" posts featuring your best performers
- Share behind-the-scenes content about your curation process
- Use Instagram Stories to showcase new arrivals

**📅 Trending Now:**
Oversized silhouettes and neutral tones are trending this month. Your wool coat is perfectly positioned!`
      } else if (lowerMessage.includes('underperforming') || lowerMessage.includes('performance')) {
        aiResponse = `Let me analyze your product performance:

**⚠️ Needs Attention:**
- **Relaxed Linen Shirt**: Only 67 views, 8 favorites
- Conversion rate: 11.9% (below average)

**🔍 Why it might be underperforming:**
- Limited lifestyle photos
- Generic description
- No styling suggestions

**💡 Improvement Suggestions:**
1. Add more lifestyle shots showing the shirt styled
2. Include specific styling tips in description
3. Consider seasonal promotion (perfect for spring!)
4. Add size guide and fabric details

**📈 Quick Fix:**
Try updating the product description with: "Perfect for effortless summer styling. Pair with high-waisted trousers for a polished look, or layer under a blazer for office-ready elegance."`
      } else if (lowerMessage.includes('hashtag') || lowerMessage.includes('social')) {
        aiResponse = `Here are trending hashtags for your products:

**🎯 General Fashion:**
#minimaliststyle #slowfashion #curatedfashion #sustainablefashion

**👔 For Your Blazer:**
#minimalistblazer #officewear #businesscasual #timelessstyle

**🧥 For Your Coat:**
#oversizedcoat #winterstyle #luxuryfashion #investmentpiece

**👕 For Your Shirt:**
#linenshirt #summerstyle #effortlesschic #casualfashion

**📱 Pro Tips:**
- Use 15-20 hashtags per post
- Mix popular and niche hashtags
- Create a branded hashtag: #IsabellaEdit
- Monitor which hashtags drive the most engagement

**🔥 Trending This Week:**
#minimaliststyle (+12% engagement)
#curatedfashion (+8% engagement)`
      } else {
        aiResponse = `I'd be happy to help you with that! Here are some ways I can assist you:

**📊 Analytics & Performance:**
- Product performance analysis
- Traffic and engagement insights
- Conversion rate optimization

**🎨 Styling & Curation:**
- Product styling suggestions
- Trend analysis and recommendations
- Inventory optimization tips

**📱 Marketing & Promotion:**
- Social media strategy
- Hashtag recommendations
- Content creation ideas

**🛍️ Product Discovery:**
- Similar product suggestions
- Trend forecasting
- Competitor analysis

Just let me know what specific area you'd like to focus on, and I'll provide personalized recommendations based on your store data!`
      }
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: aiResponse,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setIsLoading(false)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !uploadedImage) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      image: uploadedImage || undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    
    if (uploadedImage) {
      removeImage()
    }

    // Generate AI response
    await simulateAIResponse(inputValue, !!uploadedImage)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedQuestion = async (question: string) => {
    setInputValue(question)
    // Auto-send the suggested question
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    await simulateAIResponse(question)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container-custom max-w-4xl">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/curator"
                className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-carbon" />
              <h1 className="text-xl font-semibold text-carbon">Ask Nigel</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom max-w-4xl py-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="font-serif text-3xl font-light mb-2">Ask Nigel</h1>
          <p className="text-gray-600">
            Your personal AI assistant to help you grow your curator store
          </p>
        </motion.div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-carbon text-white' 
                          : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
                      }`}>
                        {message.type === 'user' ? (
                          <span className="text-sm font-medium">U</span>
                        ) : (
                          <Brain className="w-4 h-4" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={`rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-carbon text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.image && (
                          <div className="mb-3">
                            <img
                              src={message.image}
                              alt="Uploaded"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        {message.isTyping ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Nigel is typing...</span>
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            {message.content.split('\n').map((line, index) => (
                              <p key={index} className="mb-2 last:mb-0">
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                        <span className="text-gray-600">Nigel is thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="border-t border-gray-200 p-4"
            >
              <p className="text-sm text-gray-600 mb-3">Try asking me:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            {/* Image Preview */}
            {showImagePreview && uploadedImage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 relative"
              >
                <div className="relative inline-block">
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}

            <div className="flex items-end space-x-3">
              {/* File Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-carbon transition-colors"
                title="Upload Image"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Text Input */}
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Nigel anything about your store, products, or strategy..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon resize-none"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && !uploadedImage) || isLoading}
                className="p-3 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Hint */}
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: You can upload an image to find similar products or get styling suggestions!
            </p>
          </div>
        </div>

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-medium text-carbon mb-2">Performance Analysis</h3>
            <p className="text-sm text-gray-600">
              Get insights on your product performance and optimization suggestions
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-medium text-carbon mb-2">Strategy Guidance</h3>
            <p className="text-sm text-gray-600">
              Receive personalized recommendations for growing your curator business
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <Image className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-medium text-carbon mb-2">Visual Search</h3>
            <p className="text-sm text-gray-600">
              Upload images to find similar products and styling inspiration
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 