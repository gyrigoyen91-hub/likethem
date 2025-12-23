'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  Upload, 
  Globe, 
  Instagram, 
  Twitter, 
  Youtube,
  Eye,
  ToggleLeft,
  ToggleRight,
  Star,
  ArrowLeft,
  X,
  Check
} from 'lucide-react'
import Link from 'next/link'

interface StoreProfile {
  name: string
  bio: string
  city: string
  style: string
  avatar: string
  banner: string
  isEditorPick: boolean
  isPublic: boolean
  socialLinks: {
    instagram?: string
    twitter?: string
    youtube?: string
    website?: string
  }
  badges: string[]
  tags: string[]
}

const availableTags = [
  'Minimal', 'Streetwear', 'Vintage', 'Luxury', 'Casual', 'Formal',
  'Oversized', 'Fitted', 'Neutral', 'Colorful', 'Monochrome', 'Patterned',
  'Sustainable', 'Handmade', 'Contemporary', 'Classic', 'Trendy', 'Timeless'
]

export default function StorePage() {
  const [profile, setProfile] = useState<StoreProfile>({
    name: 'Isabella\'s Edit',
    bio: 'Curating timeless pieces for the modern minimalist. Based in New York, inspired by Tokyo street style and Scandinavian design.',
    city: 'New York',
    style: 'minimal, oversized, neutral',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    isEditorPick: true,
    isPublic: true,
    socialLinks: {
      instagram: '@isabella_edit',
      twitter: '@isabella_style',
      website: 'https://isabella-edit.com'
    },
    badges: ['Top Seller', 'Style Star'],
    tags: ['Minimal', 'Oversized', 'Neutral']
  })

  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      alert('Please upload a JPG or PNG file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
      setHasUnsavedChanges(true)
    }
    reader.readAsDataURL(file)
  }

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      alert('Please upload a JPG or PNG file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setBannerPreview(e.target?.result as string)
      setHasUnsavedChanges(true)
    }
    reader.readAsDataURL(file)
  }

  const handleFieldChange = (field: keyof StoreProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }))
    setHasUnsavedChanges(true)
  }

  const toggleTag = (tag: string) => {
    const newTags = profile.tags.includes(tag)
      ? profile.tags.filter(t => t !== tag)
      : [...profile.tags, tag]
    
    setProfile(prev => ({ ...prev, tags: newTags }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Saving profile:', profile)
    setIsSaving(false)
    setHasUnsavedChanges(false)
    
    // Show success toast
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const togglePublic = () => {
    setProfile(prev => ({ ...prev, isPublic: !prev.isPublic }))
    setHasUnsavedChanges(true)
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        window.location.href = '/dashboard/curator'
      }
    } else {
      window.location.href = '/dashboard/curator'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/curator"
                className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/curator/isabella"
                target="_blank"
                className="flex items-center space-x-2 text-carbon hover:text-black transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview My Store</span>
              </a>
            </div>
          </div>
          
          <div className="mt-6">
            <h1 className="font-serif text-3xl font-light mb-2">Edit Store Profile</h1>
            <p className="text-gray-600">
              Update your store information and appearance
            </p>
          </div>

          {/* Status Badge */}
          {profile.isEditorPick && (
            <div className="mt-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">Editor's Pick</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Curator Display Name *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    maxLength={50}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                    placeholder="Your store name"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.name.length}/50 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio / Store Description *
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleFieldChange('bio', e.target.value)}
                    maxLength={280}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon resize-none"
                    placeholder="Tell visitors about your style and curation philosophy..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.bio.length}/280 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location / City
                    </label>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                      placeholder="e.g., New York"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style Tags
                    </label>
                    <input
                      type="text"
                      value={profile.style}
                      onChange={(e) => handleFieldChange('style', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                      placeholder="e.g., minimal, oversized, neutral"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Store Tags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">Store Tags / Style Labels</h2>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select tags that best describe your curation style
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-2 rounded-full text-sm transition-colors ${
                        profile.tags.includes(tag)
                          ? 'bg-carbon text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">Social Media</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Instagram className="w-5 h-5 text-pink-500" />
                  <input
                    type="text"
                    value={profile.socialLinks.instagram || ''}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                    placeholder="@username"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Twitter className="w-5 h-5 text-blue-400" />
                  <input
                    type="text"
                    value={profile.socialLinks.twitter || ''}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                    placeholder="@username"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <input
                    type="text"
                    value={profile.socialLinks.youtube || ''}
                    onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                    placeholder="Channel URL"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={profile.socialLinks.website || ''}
                    onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
            </div>

            {/* Store Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">Store Settings</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Store Status</h3>
                    <p className="text-sm text-gray-600">
                      {profile.isPublic ? 'Public' : 'Private'} - {profile.isPublic ? 'Visitors can browse your store' : 'Store is hidden from visitors'}
                    </p>
                  </div>
                  <button
                    onClick={togglePublic}
                    className="flex items-center space-x-2"
                  >
                    {profile.isPublic ? (
                      <ToggleRight className="w-6 h-6 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Editor's Pick</h3>
                    <p className="text-sm text-gray-600">
                      Featured curator status (admin controlled)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile.isEditorPick && (
                      <Star className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className="text-sm text-gray-500">
                      {profile.isEditorPick ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Profile Photo Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">Profile Picture</h2>
              
              <div className="space-y-4">
                <div className="relative mx-auto w-32 h-32">
                  <img
                    src={avatarPreview || profile.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-carbon text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">
                    Crop to circle, display at 1:1 ratio
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">Banner Image</h2>
              
              <div className="space-y-4">
                <div className="relative w-full h-32">
                  <img
                    src={bannerPreview || profile.banner}
                    alt="Banner"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <label className="absolute bottom-2 right-2 w-8 h-8 bg-carbon text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Recommended: 1440x400px
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-serif text-xl font-light mb-6">Badges</h2>
              
              <div className="space-y-3">
                {profile.badges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center space-x-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-800">{badge}</span>
                  </div>
                ))}
                
                {profile.badges.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No badges yet. Keep curating to earn them!
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="w-full py-3 px-6 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleCancel}
                  className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50"
        >
          <Check className="w-5 h-5" />
          <span>Profile updated successfully!</span>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  )
} 