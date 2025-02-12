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

  const avatarOptions = [
    'gray-solo-av.png',
    'white-solo-av.png',
    'black-solo-av.png',
    'purple-solo-av.png'
  ]

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <Card className="bg-gray-800 mb-6">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Settings</h2>

          <div className="mb-6">
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

          <h3 className="text-lg font-semibold text-white mb-4">Profile Photo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                className={`relative rounded-full overflow-hidden border-4 ${
                  selectedAvatar === avatar ? 'border-purple-600' : 'border-transparent'
                }`}
                disabled={isUpdating}
              >
                <img
                  src={`/avatars/${avatar}`}
                  alt={`Avatar option ${avatar}`}
                  className="w-full h-auto"
                />
              </button>
            ))}
          </div>

          <button
            onClick={handleProfileUpdate}
            disabled={isUpdating}
            className="w-full btn bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center mb-4"
          >
            <i className="material-icons mr-2">save</i>
            Save Changes
          </button>
        </div>
      </Card>

      <Card className="bg-gray-800 mb-6">
        <div className="p-6">
          <button
            onClick={handleLogout}
            className="w-full btn bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center justify-center"
          >
            <i className="material-icons mr-2">logout</i>
            Logout
          </button>
        </div>
      </Card>
    </div>
  )
}

export default Settings