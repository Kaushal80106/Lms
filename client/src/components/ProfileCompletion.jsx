import React, { useState, useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const ProfileCompletion = ({ onComplete, isOpen }) => {
  const { backendUrl, getToken, userData, setUserData } = useContext(AppContext)
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Show modal if user data is incomplete
    if (userData && !userData.isProfileComplete) {
      setShowModal(true)
    }
  }, [userData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Please enter your name')
      return
    }

    setLoading(true)

    try {
      const token = await getToken()
      
      const { data } = await axios.post(`${backendUrl}/api/user/complete-profile`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (data.success) {
        toast.success('Profile completed successfully!')
        
        // Update user data in context
        if (setUserData) {
          setUserData(prev => ({
            ...prev,
            ...data.user
          }))
        }
        
        setShowModal(false)
        if (onComplete) onComplete()
      } else {
        toast.error(data.message || 'Failed to complete profile')
      }
    } catch (error) {
      console.error('Error completing profile:', error)
      toast.error('Failed to complete profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600">Please provide your name to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture URL (Optional)
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Completing...' : 'Complete Profile'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You can update your profile anytime from your account settings
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProfileCompletion
