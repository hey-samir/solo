import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { Input } from '../components/ui/input'
import '../styles/profile.css'

// Import avatars
import graySoloAvatar from '../assets/images/avatars/gray-solo-av.png'
import whiteSoloAvatar from '../assets/images/avatars/white-solo-av.png'
import blackSoloAvatar from '../assets/images/avatars/black-solo-av.png'
import purpleSoloAvatar from '../assets/images/avatars/purple-solo-av.png'

// Avatar mapping
const avatars = {
  gray: graySoloAvatar,
  white: whiteSoloAvatar,
  black: blackSoloAvatar,
  purple: purpleSoloAvatar
}

const Solo: FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || '')
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.profilePhoto || 'gray')

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to logout')
    }
  }

  // Stats from Profile
  const stats = {
    burns: 0,
    avgGrade: '--',
    totalPoints: 0
  }

  const handleUpdateProfile = async () => {
    try {
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Table Layout */}
        <div className="flex items-start gap-8">
          {/* Column 1: Avatar */}
          <div className="w-32 flex-shrink-0">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                {['gray', 'white', 'black', 'purple'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedAvatar(color)}
                    className={`relative rounded-full overflow-hidden border-2 ${
                      selectedAvatar === color ? 'border-purple-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={avatars[color as keyof typeof avatars]}
                      alt={`${color} avatar`}
                      className="w-full h-auto"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <img 
                src={avatars[selectedAvatar as keyof typeof avatars]}
                alt={`${user?.username}'s profile`}
                className="profile-avatar"
              />
            )}
          </div>

          {/* Column 2: User Info Table */}
          <div className="flex-grow">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="py-2">
                    {isEditing ? (
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="text-2xl font-bold bg-gray-700"
                        placeholder="Enter username"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold">@{user?.username}</h1>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2">
                    <div className="profile-field">
                      <span className="profile-field-label">Home Gym</span>
                      <span className="profile-field-value">{user?.homeGym || 'Movement Gowanus'}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">
                    <div className="profile-field">
                      <span className="profile-field-label">Joined</span>
                      <span className="profile-field-value">
                        {new Date(user?.memberSince || Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          year: '2-digit'
                        })}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Button Row */}
        <div className="profile-buttons">
          <button 
            className="btn bg-purple-600 text-white rounded-lg"
            onClick={() => {
              if (isEditing) {
                handleUpdateProfile()
              } else {
                setIsEditing(true)
              }
            }}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
          <button 
            className="btn bg-purple-600 text-white rounded-lg"
            onClick={() => {
              const profileUrl = `${window.location.origin}/solo/${user?.username}`
              navigator.clipboard.writeText(profileUrl)
              toast.success('Profile link copied')
            }}
          >
            Share
          </button>
          <button 
            onClick={handleLogout}
            className="btn bg-gray-600 text-white rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* KPI Cards Row */}
        <div className="profile-metrics">
          <div className="metric-card">
            <div className="metric-value">{stats.burns}</div>
            <div className="metric-label">Burns</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.avgGrade}</div>
            <div className="metric-label">Average Grade</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{stats.totalPoints}</div>
            <div className="metric-label">Total Points</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Solo