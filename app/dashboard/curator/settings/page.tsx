'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  Save,
  Bell,
  Shield,
  Eye,
  AlertTriangle,
  Trash2,
  Upload,
  X,
  Check,
  Instagram,
  Youtube,
  Twitter,
  User,
  Mail,
  Lock,
  Settings as SettingsIcon,
  Store,
  EyeOff,
  Users,
  Heart,
  MessageSquare,
  Package,
  DollarSign,
  Globe,
  Camera
} from 'lucide-react'
import Link from 'next/link'

interface CuratorSettings {
  storeName: string
  bio: string
  profileImage: string
  bannerImage: string
  socialLinks: {
    instagram: string
    tiktok: string
    youtube: string
    twitter: string
  }
  notifications: {
    followers: boolean
    favorites: boolean
    collaborations: boolean
    orders: boolean
  }
  privacy: {
    showSales: boolean
    showEarnings: boolean
    allowCollaborations: boolean
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'store' | 'notifications' | 'security' | 'privacy' | 'danger'>('store')
  const [settings, setSettings] = useState<CuratorSettings>({
    storeName: "Isabella's Closet",
    bio: "Eclectic, vibrant, conscious fashion for the modern woman who values both style and sustainability.",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    bannerImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    socialLinks: {
      instagram: "https://instagram.com/isabella_edit",
      tiktok: "https://tiktok.com/@isabella_style",
      youtube: "",
      twitter: "https://twitter.com/isabella_fashion"
    },
    notifications: {
      followers: true,
      favorites: true,
      collaborations: true,
      orders: true
    },
    privacy: {
      showSales: false,
      showEarnings: true,
      allowCollaborations: true
    }
  })

  // Security state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Image upload states
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  // Danger zone state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // General states
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const tabs = [
    { id: 'store', label: 'Store Info', icon: <Store className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye className="w-4 h-4" /> },
    { id: 'danger', label: 'Danger Zone', icon: <AlertTriangle className="w-4 h-4" /> }
  ]

  const handleFieldChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
    setHasUnsavedChanges(true)
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleNotificationChange = (type: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handlePrivacyChange = (type: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
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
      const result = e.target?.result as string
      if (type === 'profile') {
        setProfilePreview(result)
        handleFieldChange('profileImage', result)
      } else {
        setBannerPreview(result)
        handleFieldChange('bannerImage', result)
      }
      setHasUnsavedChanges(true)
    }
    reader.readAsDataURL(file)
  }

  const saveStoreInfo = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Saving store info:', settings)
    
    setIsSaving(false)
    setHasUnsavedChanges(false)
    setShowSuccessToast(true)
    
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      alert('New password must be at least 8 characters long')
      return
    }

    setIsChangingPassword(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Changing password:', { currentPassword, newPassword })
    
    setIsChangingPassword(false)
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    
    alert('Password changed successfully!')
  }

  const updateNotifications = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Updating notifications:', settings.notifications)
    
    setIsSaving(false)
    setHasUnsavedChanges(false)
    setShowSuccessToast(true)
    
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const updatePrivacy = async () => {
    setIsSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('Updating privacy settings:', settings.privacy)
    
    setIsSaving(false)
    setHasUnsavedChanges(false)
    setShowSuccessToast(true)
    
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  const deleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion')
      return
    }

    setIsDeleting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('Deleting account...')
    
    setIsDeleting(false)
    setShowDeleteModal(false)
    setDeleteConfirmation('')
    
    // Redirect to homepage after deletion
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-24">
      <div className="container-custom max-w-7xl">
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
          </div>
          
          <div className="mt-6">
            <h1 className="font-serif text-3xl font-light mb-2">Settings</h1>
            <p className="text-gray-600">
              Update your store preferences and account configuration
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-carbon text-white'
                        : 'text-gray-600 hover:text-carbon hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Store Info Tab */}
              {activeTab === 'store' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-light mb-6">Store Information</h2>
                  
                  <div className="space-y-8">
                    {/* Profile & Banner Images */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Profile Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Profile Image
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={profilePreview || settings.profileImage}
                              alt="Profile"
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            />
                            <label className="absolute bottom-0 right-0 bg-carbon text-white p-1 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                              <Camera className="w-3 h-3" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'profile')}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Upload a square image</p>
                            <p className="text-xs text-gray-500">Max 5MB, JPG or PNG</p>
                          </div>
                        </div>
                      </div>

                      {/* Banner Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Banner Image
                        </label>
                        <div className="space-y-3">
                          <div className="relative">
                            <img
                              src={bannerPreview || settings.bannerImage}
                              alt="Banner"
                              className="w-full h-20 rounded-lg object-cover border-2 border-gray-200"
                            />
                            <label className="absolute bottom-2 right-2 bg-carbon text-white p-1 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                              <Camera className="w-3 h-3" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'banner')}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">Max 5MB, JPG or PNG</p>
                        </div>
                      </div>
                    </div>

                    {/* Store Name & Bio */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Store Name
                        </label>
                        <input
                          type="text"
                          value={settings.storeName}
                          onChange={(e) => handleFieldChange('storeName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                          placeholder="Enter your store name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={settings.bio}
                          onChange={(e) => handleFieldChange('bio', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon resize-none"
                          placeholder="Tell us about your store and style..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {settings.bio.length}/280 characters
                        </p>
                      </div>
                    </div>

                    {/* Social Media Links */}
                    <div>
                      <h3 className="text-lg font-medium text-carbon mb-4">Social Media Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Instagram className="w-4 h-4 inline mr-2" />
                            Instagram
                          </label>
                          <input
                            type="url"
                            value={settings.socialLinks.instagram}
                            onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                            placeholder="https://instagram.com/username"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Twitter className="w-4 h-4 inline mr-2" />
                            Twitter
                          </label>
                          <input
                            type="url"
                            value={settings.socialLinks.twitter}
                            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                            placeholder="https://twitter.com/username"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Youtube className="w-4 h-4 inline mr-2" />
                            YouTube
                          </label>
                          <input
                            type="url"
                            value={settings.socialLinks.youtube}
                            onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                            placeholder="https://youtube.com/@username"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            TikTok
                          </label>
                          <input
                            type="url"
                            value={settings.socialLinks.tiktok}
                            onChange={(e) => handleSocialLinkChange('tiktok', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                            placeholder="https://tiktok.com/@username"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={saveStoreInfo}
                        disabled={isSaving || !hasUnsavedChanges}
                        className="px-6 py-3 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-light mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-carbon" />
                          <div>
                            <p className="font-medium text-carbon">New Followers</p>
                            <p className="text-sm text-gray-600">Get notified when someone follows your store</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.followers}
                            onChange={(e) => handleNotificationChange('followers', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-carbon"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Heart className="w-5 h-5 text-carbon" />
                          <div>
                            <p className="font-medium text-carbon">Product Favorites</p>
                            <p className="text-sm text-gray-600">Get notified when someone favorites your products</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.favorites}
                            onChange={(e) => handleNotificationChange('favorites', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-carbon"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <MessageSquare className="w-5 h-5 text-carbon" />
                          <div>
                            <p className="font-medium text-carbon">Collaboration Requests</p>
                            <p className="text-sm text-gray-600">Get notified when someone proposes a collaboration</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.collaborations}
                            onChange={(e) => handleNotificationChange('collaborations', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-carbon"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Package className="w-5 h-5 text-carbon" />
                          <div>
                            <p className="font-medium text-carbon">New Orders</p>
                            <p className="text-sm text-gray-600">Get notified when you receive new orders</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.orders}
                            onChange={(e) => handleNotificationChange('orders', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-carbon"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={updateNotifications}
                        disabled={isSaving || !hasUnsavedChanges}
                        className="px-6 py-3 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Update Preferences</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-light mb-6">Security Settings</h2>
                  
                  <div className="max-w-md space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                        placeholder="Enter your current password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                        placeholder="Enter your new password"
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon"
                        placeholder="Confirm your new password"
                      />
                    </div>

                    <button
                      onClick={changePassword}
                      disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="w-full px-6 py-3 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Changing Password...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Change Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-light mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-5 h-5 text-carbon" />
                          <div>
                            <p className="font-medium text-carbon">Show Sales Publicly</p>
                            <p className="text-sm text-gray-600">Display your sales numbers on your public profile</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showSales}
                            onChange={(e) => handlePrivacyChange('showSales', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-carbon"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Eye className="w-5 h-5 text-carbon" />
                          <div>
                            <p className="font-medium text-carbon">Show Earnings (Private)</p>
                            <p className="text-sm text-gray-600">Display earnings in your private dashboard</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.showEarnings}
                            onChange={(e) => handlePrivacyChange('showEarnings', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-carbon"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5 text-carbon" />
                          <div>
                            <p className="font-medium text-carbon">Allow Collaboration Requests</p>
                            <p className="text-sm text-gray-600">Let other curators send you collaboration proposals</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.privacy.allowCollaborations}
                            onChange={(e) => handlePrivacyChange('allowCollaborations', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-carbon"></div>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={updatePrivacy}
                        disabled={isSaving || !hasUnsavedChanges}
                        className="px-6 py-3 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Update Privacy Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-light mb-6">Danger Zone</h2>
                  
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex items-start space-x-4">
                      <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-red-900 mb-2">Delete Account</h3>
                        <p className="text-red-700 mb-4">
                          This action cannot be undone. This will permanently delete your account, 
                          remove all your products, collaborations, and data from LikeThem.
                        </p>
                        <button
                          onClick={() => setShowDeleteModal(true)}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete My Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 z-50"
            >
              <Check className="w-5 h-5" />
              <span>Settings updated successfully!</span>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="ml-4"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Account Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg max-w-md w-full p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-semibold text-red-900">Delete Account</h2>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    This action is irreversible. All your data, products, and collaborations will be permanently deleted.
                  </p>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-red-700">
                      To confirm deletion, please type <strong>DELETE</strong> in the field below:
                    </p>
                  </div>

                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeleteConfirmation('')
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteAccount}
                    disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Confirm Deletion</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 