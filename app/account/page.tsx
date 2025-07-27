'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Edit, Plus, Trash2, User, MapPin, CreditCard, Palette } from 'lucide-react'

export default function AccountPage() {
  const [activeSection, setActiveSection] = useState('personal')
  const [isEditing, setIsEditing] = useState(false)

  const sections = [
    { id: 'personal', title: 'Personal Details', icon: User },
    { id: 'shipping', title: 'Shipping Address', icon: MapPin },
    { id: 'payment', title: 'Payment Methods', icon: CreditCard },
    { id: 'style', title: 'Style Profile', icon: Palette }
  ]

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
                    {section.id === 'personal' && <PersonalDetails isEditing={isEditing} setIsEditing={setIsEditing} />}
                    {section.id === 'shipping' && <ShippingAddress />}
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

function PersonalDetails({ isEditing, setIsEditing }: { isEditing: boolean; setIsEditing: (value: boolean) => void }) {
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
            defaultValue="Maria Gonzalez"
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <input
            type="email"
            defaultValue="maria@example.com"
            disabled={!isEditing}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-carbon disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
          <input
            type="tel"
            defaultValue="+34 600 123 456"
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
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border border-carbon text-carbon hover:bg-carbon hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button className="px-6 py-2 bg-carbon text-white hover:bg-gray-800 transition-colors">
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
}

function ShippingAddress() {
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
              <p className="text-sm text-gray-600 mb-1">Maria Gonzalez</p>
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