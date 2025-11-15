'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  Send,
  Filter,
  Search,
  Heart,
  Eye,
  TrendingUp,
  Calendar,
  Mail,
  Star,
  MoreVertical,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface SuggestedCurator {
  id: string
  name: string
  username: string
  avatar: string
  followers: number
  style: string
  engagement: number
  compatibility: number
  previousCollaborations: number
}

interface CollaborationRequest {
  id: string
  fromCurator: {
    id: string
    name: string
    username: string
    avatar: string
  }
  toCurator: {
    id: string
    name: string
    username: string
    avatar: string
  }
  status: 'pending' | 'accepted' | 'declined'
  message: string
  createdAt: Date
  projectType?: string
}

interface ActiveCollaboration {
  id: string
  partner: {
    id: string
    name: string
    username: string
    avatar: string
  }
  projectName: string
  status: 'planning' | 'active' | 'completed'
  startDate: Date
  endDate?: Date
  description: string
  jointPageUrl?: string
}

export default function CollaborationsPage() {
  const [activeTab, setActiveTab] = useState<'suggested' | 'outgoing' | 'incoming' | 'active'>('suggested')
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [selectedCurator, setSelectedCurator] = useState<SuggestedCurator | null>(null)
  const [proposalMessage, setProposalMessage] = useState('')
  const [isSendingProposal, setIsSendingProposal] = useState(false)

  // Mock Data
  const suggestedCurators: SuggestedCurator[] = [
    {
      id: '1',
      name: 'Sofia Laurent',
      username: '@sofia_laurent',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      followers: 12400,
      style: 'minimal, luxury, neutral',
      engagement: 8.5,
      compatibility: 95,
      previousCollaborations: 2
    },
    {
      id: '2',
      name: 'Alex Rivera',
      username: '@alex_rivera_style',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      followers: 8900,
      style: 'streetwear, urban, oversized',
      engagement: 7.2,
      compatibility: 87,
      previousCollaborations: 0
    },
    {
      id: '3',
      name: 'Emma Thompson',
      username: '@emma_thompson_edit',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      followers: 15600,
      style: 'feminine, romantic, vintage',
      engagement: 9.1,
      compatibility: 78,
      previousCollaborations: 1
    },
    {
      id: '4',
      name: 'Marcus Chen',
      username: '@marcus_chen_fashion',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      followers: 21000,
      style: 'contemporary, tailored, sophisticated',
      engagement: 6.8,
      compatibility: 92,
      previousCollaborations: 3
    }
  ]

  const outgoingRequests: CollaborationRequest[] = [
    {
      id: '1',
      fromCurator: {
        id: 'current',
        name: 'Isabella Chen',
        username: '@isabella_edit',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      toCurator: {
        id: '5',
        name: 'David Rodriguez',
        username: '@david_rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      status: 'pending',
      message: 'Hi David! I love your minimalist aesthetic. Would you be interested in collaborating on a spring collection?',
      createdAt: new Date('2024-01-20'),
      projectType: 'Seasonal Collection'
    },
    {
      id: '2',
      fromCurator: {
        id: 'current',
        name: 'Isabella Chen',
        username: '@isabella_edit',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      toCurator: {
        id: '6',
        name: 'Sarah Johnson',
        username: '@sarah_johnson_style',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      status: 'accepted',
      message: 'Hi Sarah! Your sustainable fashion approach is inspiring. Let\'s create something amazing together!',
      createdAt: new Date('2024-01-15'),
      projectType: 'Sustainable Collection'
    }
  ]

  const incomingRequests: CollaborationRequest[] = [
    {
      id: '3',
      fromCurator: {
        id: '7',
        name: 'Michael Chen',
        username: '@michael_chen_fashion',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      toCurator: {
        id: 'current',
        name: 'Isabella Chen',
        username: '@isabella_edit',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      status: 'pending',
      message: 'Hi Isabella! Your curation style is exactly what I\'m looking for. Would you be interested in a summer collaboration?',
      createdAt: new Date('2024-01-25'),
      projectType: 'Summer Collection'
    }
  ]

  const activeCollaborations: ActiveCollaboration[] = [
    {
      id: '1',
      partner: {
        id: '6',
        name: 'Sarah Johnson',
        username: '@sarah_johnson_style',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
      },
      projectName: 'Sustainable Spring Collection',
      status: 'active',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      description: 'A collaborative collection focusing on sustainable materials and timeless design.',
      jointPageUrl: '/collaboration/sustainable-spring-2024'
    }
  ]

  const handleProposeCollaboration = (curator: SuggestedCurator) => {
    setSelectedCurator(curator)
    setShowProposalModal(true)
  }

  const sendProposal = async () => {
    if (!selectedCurator || !proposalMessage.trim()) return

    setIsSendingProposal(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Sending collaboration proposal:', {
      toCurator: selectedCurator.id,
      message: proposalMessage
    })
    
    setIsSendingProposal(false)
    setShowProposalModal(false)
    setProposalMessage('')
    setSelectedCurator(null)
    
    // Show success message
    alert('Collaboration proposal sent successfully!')
  }

  const handleRequestAction = async (requestId: string, action: 'accept' | 'decline') => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log(`${action}ing request:`, requestId)
    
    // Show success message
    alert(`Request ${action}ed successfully!`)
  }

  const cancelRequest = async (requestId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Canceling request:', requestId)
    
    // Show success message
    alert('Request canceled successfully!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'accepted': return 'text-green-600 bg-green-50'
      case 'declined': return 'text-red-600 bg-red-50'
      case 'active': return 'text-blue-600 bg-blue-50'
      case 'planning': return 'text-purple-600 bg-purple-50'
      case 'completed': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'declined': return <XCircle className="w-4 h-4" />
      case 'active': return <TrendingUp className="w-4 h-4" />
      case 'planning': return <Calendar className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const tabs = [
    { id: 'suggested', label: 'Suggested Curators', icon: <Users className="w-4 h-4" /> },
    { id: 'outgoing', label: 'My Requests', icon: <Send className="w-4 h-4" /> },
    { id: 'incoming', label: 'Incoming Requests', icon: <Mail className="w-4 h-4" /> },
    { id: 'active', label: 'Active Collaborations', icon: <CheckCircle className="w-4 h-4" /> }
  ]

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
            <h1 className="font-serif text-3xl font-light mb-2">Collaborations</h1>
            <p className="text-gray-600">
              Team up with other curators to create powerful, co-branded fashion moments
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-8"
        >
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-carbon text-white'
                    : 'text-gray-600 hover:text-carbon hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Suggested Curators */}
          {activeTab === 'suggested' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedCurators.map((curator, index) => (
                <motion.div
                  key={curator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={curator.avatar}
                      alt={curator.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-carbon">{curator.name}</h3>
                      <p className="text-sm text-gray-600">{curator.username}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          {curator.followers.toLocaleString()} followers
                        </span>
                        <span className="text-sm text-gray-500">
                          {curator.engagement}% engagement
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Style</p>
                      <p className="text-sm font-medium">{curator.style}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Compatibility</p>
                        <p className="text-sm font-medium text-green-600">{curator.compatibility}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Previous Collabs</p>
                        <p className="text-sm font-medium">{curator.previousCollaborations}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleProposeCollaboration(curator)}
                    className="w-full py-2 px-4 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Propose Collaboration
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Outgoing Requests */}
          {activeTab === 'outgoing' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Curator</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Project Type</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                      <th className="text-center py-3 px-6 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outgoingRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <img
                              src={request.toCurator.avatar}
                              alt={request.toCurator.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-carbon">{request.toCurator.name}</p>
                              <p className="text-sm text-gray-600">{request.toCurator.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{request.projectType}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-600">
                            {request.createdAt.toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {request.status === 'pending' && (
                            <button
                              onClick={() => cancelRequest(request.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Incoming Requests */}
          {activeTab === 'incoming' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Curator</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Project Type</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Message</th>
                      <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                      <th className="text-center py-3 px-6 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingRequests.map((request) => (
                      <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <img
                              src={request.fromCurator.avatar}
                              alt={request.fromCurator.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium text-carbon">{request.fromCurator.name}</p>
                              <p className="text-sm text-gray-600">{request.fromCurator.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-900">{request.projectType}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-600 max-w-xs truncate">
                            {request.message}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-600">
                            {request.createdAt.toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleRequestAction(request.id, 'accept')}
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRequestAction(request.id, 'decline')}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active Collaborations */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              {activeCollaborations.map((collaboration, index) => (
                <motion.div
                  key={collaboration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={collaboration.partner.avatar}
                        alt={collaboration.partner.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-carbon">{collaboration.partner.name}</h3>
                        <p className="text-sm text-gray-600">{collaboration.partner.username}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(collaboration.status)}`}>
                          {getStatusIcon(collaboration.status)}
                          <span className="ml-1 capitalize">{collaboration.status}</span>
                        </span>
                      </div>
                    </div>
                    
                    {collaboration.jointPageUrl && (
                      <Link
                        href={collaboration.jointPageUrl}
                        className="px-4 py-2 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        View Joint Page
                      </Link>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-carbon mb-1">{collaboration.projectName}</h4>
                      <p className="text-sm text-gray-600">{collaboration.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Started: {collaboration.startDate.toLocaleDateString()}</span>
                      </div>
                      {collaboration.endDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Ends: {collaboration.endDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {activeCollaborations.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Collaborations</h3>
                  <p className="text-gray-600">
                    Start collaborating with other curators to create amazing fashion moments together!
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Proposal Modal */}
        <AnimatePresence>
          {showProposalModal && selectedCurator && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-carbon">Propose Collaboration</h2>
                  <button
                    onClick={() => setShowProposalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={selectedCurator.avatar}
                      alt={selectedCurator.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-carbon">{selectedCurator.name}</p>
                      <p className="text-sm text-gray-600">{selectedCurator.username}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collaboration Message
                  </label>
                  <textarea
                    value={proposalMessage}
                    onChange={(e) => setProposalMessage(e.target.value)}
                    placeholder="Hi! I'd love to collaborate with you on..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-carbon resize-none"
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowProposalModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendProposal}
                    disabled={!proposalMessage.trim() || isSendingProposal}
                    className="px-4 py-2 bg-carbon text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSendingProposal ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Request</span>
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