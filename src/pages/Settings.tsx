import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import toast from 'react-hot-toast'
import client from '../api/client'

const Settings: React.FC = () => {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState(user?.username || '')
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.profilePhoto || 'gray-solo-av.png')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleProfileUpdate = async () => {
    try {
      setIsUpdating(true)
      await client.put('/api/users/profile', {
        username,
        profilePhoto: selectedAvatar
      })
      await refreshUser()
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to logout')
    }
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card className="bg-gray-800 mb-6">
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            {/* Avatar Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {['gray', 'white', 'black', 'purple'].map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedAvatar(`${color}-solo-av.png`)}
                  className={`relative rounded-full overflow-hidden border-4 ${
                    selectedAvatar === `${color}-solo-av.png` ? 'border-purple-600' : 'border-transparent'
                  }`}
                  disabled={isUpdating}
                >
                  <img
                    src={`/avatars/${color}-solo-av.png`}
                    alt={`${color} avatar`}
                    className="w-24 h-24 object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Profile Info */}
            <div className="w-full mb-6">
              <label className="block text-white mb-2">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700 text-white"
                placeholder="Enter username"
                disabled={isUpdating}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleProfileUpdate}
                disabled={isUpdating}
                className="btn bg-purple-600 text-white rounded-lg flex-1"
              >
                Edit
              </button>
              <button
                onClick={() => {}} // Share functionality to be implemented
                className="btn bg-purple-600 text-white rounded-lg flex-1"
              >
                Share
              </button>
              <button
                onClick={handleLogout}
                className="btn bg-gray-600 text-white rounded-lg flex-1"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Settings