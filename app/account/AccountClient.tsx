'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, User, MapPin, CreditCard, Palette, Heart } from 'lucide-react'
import SavedItems from '@/components/account/SavedItems'

interface User {
  id: string
  email: string
  fullName: string | null
  avatar: string | null
  provider: string | null
  emailVerified: Date | null
  phone: string | null
  role: string
}

import type { Session } from 'next-auth'

interface AccountClientProps {
  user: User
  session: Session | any // Use any to avoid type conflicts with extended Session
}

export default function AccountClient({ user, session }: AccountClientProps) {
  const [activeSection, setActiveSection] = useState('personal')
  const [isEditing, setIsEditing] = useState(false)

  const sections = [
    { id: 'personal', title: 'Personal Details', icon: User },
    { id: 'saved', title: 'Saved Items', icon: Heart },
    { id: 'shipping', title: 'Shipping Address', icon: MapPin },
    { id: 'payment', title: 'Payment Methods', icon: CreditCard },
    { id: 'style', title: 'Style Profile', icon: Palette }
  ]

  // Use real user data with fallbacks
  const displayName = user.fullName ?? session.user.name ?? ''
  const displayEmail = user.email ?? session.user.email ?? ''
  const displayPhone = user.phone ?? ''
  const displayAvatar = user.avatar ?? session.user.image ?? null

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="container-custom max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-6">
            Account Information
          </h1>
          <p className="text-lg text-warm-gray font-light">
            Manage your personal details, preferences, and account settings
          </p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setActiveSection(isActive ? '' : section.id)}
                  className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Icon className="w-5 h-5 text-carbon" />
                    <h2 className="font-serif text-xl font-light">{section.title}</h2>
                  </div>
                  {isActive ? (
                    <ChevronUp className="w-5 h-5 text-carbon" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-carbon" />
                  )}
                </button>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 p-6"
                  >
                    {section.id === 'personal' && (
                      <PersonalDetails 
                        isEditing={isEditing} 
                        setIsEditing={setIsEditing}
                        user={user}
                        displayName={displayName}
                        displayEmail={displayEmail}
                        displayPhone={displayPhone}
                      />
                    )}
                    {section.id === 'saved' && <SavedItems />}
                    {section.id === 'shipping' && <ShippingAddress displayName={displayName} />}
                    {section.id === 'payment' && <PaymentMethods />}
                    {section.id === 'style' && <StyleProfile />}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PersonalDetails({ 
  isEditing, 
  setIsEditing, 
  user, 
  displayName, 
  displayEmail, 
  displayPhone 
}: { 
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  user: User
  displayName: string
  displayEmail: string
  displayPhone: string
}) {
  const [formData, setFormData] = useState({
    fullName: displayName,
    phone: displayPhone
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/account/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('[account] Update successful:', result)
        setIsEditing(false)
        // Optionally refresh the page or update local state
        window.location.reload()
      } else {
        console.error('[account] Update failed:', await response.text())
        alert('Failed to save changes. Please try again.')
      }
    } catch (error) {
      console.error('[account] Update error:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      fullName: displayName,
      phone: displayPhone
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-light">Personal Information</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
        >
          <Edit className="w-4 h-4" />
          <span className="text-sm">{isEditing ? 'Cancel' : 'Edit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            value={displayEmail}
            disabled={true}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon disabled:bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <button className="w-full px-4 py-3 border border-gray-300 text-left hover:bg-gray-50 transition-colors">
            Change Password
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end space-x-4 pt-4">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-6 py-2 border border-carbon text-carbon hover:bg-carbon hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-carbon text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}

function ShippingAddress({ displayName }: { displayName: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-light">Shipping Addresses</h3>
        <button className="flex items-center space-x-2 text-carbon hover:text-black transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add New Address</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium mb-2">Primary Address</h4>
              <p className="text-sm text-gray-600 mb-1">{displayName || 'No name provided'}</p>
              <p className="text-sm text-gray-600 mb-1">Calle Gran Vía 123</p>
              <p className="text-sm text-gray-600 mb-1">Madrid, 28013</p>
              <p className="text-sm text-gray-600">Spain</p>
            </div>
            <div className="flex space-x-2">
              <button className="text-carbon hover:text-black transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button className="text-red-500 hover:text-red-700 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentMethods() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-light">Payment Methods</h3>
        <button className="flex items-center space-x-2 text-carbon hover:text-black transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add Payment Method</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
              </div>
            </div>
            <button className="text-red-500 hover:text-red-700 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StyleProfile() {
  const stylePreferences = ['Minimal', 'Streetwear', 'Elegant', 'Vintage', 'Contemporary']
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  return (
    <div className="space-y-6">
      <h3 className="font-serif text-lg font-light">Style Preferences</h3>
      <p className="text-sm text-gray-600 mb-6">
        Help Nigel curate better recommendations for you
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-3">Style Preferences</label>
          <div className="flex flex-wrap gap-2">
            {stylePreferences.map((style) => (
              <button
                key={style}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-carbon hover:text-carbon transition-colors"
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Tops</label>
            <select className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon">
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Bottoms</label>
            <select className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon">
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Shoes</label>
            <select className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon">
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Favorite Brands or Curators</label>
          <textarea
            placeholder="e.g., Sofia Laurent, Acne Studios, minimal aesthetic..."
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon resize-none"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-2 bg-carbon text-white hover:bg-gray-800 transition-colors">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}
