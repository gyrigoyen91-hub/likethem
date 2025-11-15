'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Instagram, Users, FileText, Send } from 'lucide-react'

export default function RequestSellPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    instagram: '',
    tiktok: '',
    communitySize: '',
    motivation: '',
    portfolio: null as File | null
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, portfolio: file }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white py-24">
        <div className="container-custom max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
              Application Submitted
            </h1>
            <p className="text-lg text-warm-gray font-light mb-8 max-w-md mx-auto">
              Thank you for your interest in becoming a LikeThem curator. We'll be in touch within 7 days if your application is shortlisted.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-serif text-lg font-light mb-2">What happens next?</h3>
              <ul className="text-sm text-gray-600 space-y-2 text-left">
                <li>• Our editorial team will review your application</li>
                <li>• We'll assess your community and aesthetic alignment</li>
                <li>• Shortlisted candidates will receive an invitation</li>
                <li>• You'll get access to our curator onboarding process</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Become a Curator
          </h1>
          <p className="text-lg text-warm-gray font-light mb-8">
            Only select individuals are invited to open a LikeThem store. Apply to be reviewed by our editorial team.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Personal Information */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-light">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-6 py-4 border border-gray-300 focus:outline-none focus:border-carbon text-lg"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-6 py-4 border border-gray-300 focus:outline-none focus:border-carbon text-lg"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-light">Social Media Presence</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                  <Instagram className="w-4 h-4" />
                  <span>Instagram Handle</span>
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  className="w-full px-6 py-4 border border-gray-300 focus:outline-none focus:border-carbon text-lg"
                  placeholder="@yourhandle"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3">TikTok Handle (Optional)</label>
                <input
                  type="text"
                  value={formData.tiktok}
                  onChange={(e) => setFormData(prev => ({ ...prev, tiktok: e.target.value }))}
                  className="w-full px-6 py-4 border border-gray-300 focus:outline-none focus:border-carbon text-lg"
                  placeholder="@yourhandle"
                />
              </div>
            </div>
          </div>

          {/* Community Size */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-light">Community & Reach</h2>
            
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Community Size</span>
              </label>
              <select
                required
                value={formData.communitySize}
                onChange={(e) => setFormData(prev => ({ ...prev, communitySize: e.target.value }))}
                className="w-full px-6 py-4 border border-gray-300 focus:outline-none focus:border-carbon text-lg"
              >
                <option value="">Select your community size</option>
                <option value="1k-10k">1K - 10K followers</option>
                <option value="10k-50k">10K - 50K followers</option>
                <option value="50k-100k">50K - 100K followers</option>
                <option value="100k-500k">100K - 500K followers</option>
                <option value="500k+">500K+ followers</option>
              </select>
            </div>
          </div>

          {/* Motivation */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-light">Why LikeThem?</h2>
            
            <div>
              <label className="block text-sm font-medium mb-3">Why do you want to join LikeThem?</label>
              <textarea
                required
                value={formData.motivation}
                onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                className="w-full px-6 py-4 border border-gray-300 focus:outline-none focus:border-carbon text-lg resize-none"
                rows={6}
                placeholder="Tell us about your style philosophy, your community, and why you'd be a great curator..."
              />
            </div>
          </div>

          {/* Portfolio */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-light">Portfolio (Optional)</h2>
            
            <div>
              <label className="block text-sm font-medium mb-3 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Upload Portfolio or Lookbook</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-carbon transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="portfolio-upload"
                />
                <label htmlFor="portfolio-upload" className="cursor-pointer">
                  <p className="text-lg text-gray-600 mb-2">
                    {formData.portfolio ? formData.portfolio.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-gray-500">PDF, DOC, or DOCX (max 10MB)</p>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-8">
            <button
              type="submit"
              className="w-full bg-carbon text-white py-4 text-lg font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              Submit Application
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  )
} 