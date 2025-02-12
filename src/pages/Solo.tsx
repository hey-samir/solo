import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { Input } from '../components/ui/input'
import '../styles/profile.css'

// Fallback avatar SVGs
const avatars = {
  gray: `data:image/svg+xml;base64,${btoa(`
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#4B5563" stroke="#7442d6" stroke-width="4"/>
      <path d="M50 55C58.2843 55 65 48.2843 65 40C65 31.7157 58.2843 25 50 25C41.7157 25 35 31.7157 35 40C35 48.2843 41.7157 55 50 55Z" fill="#9CA3AF"/>
      <path d="M80 85C80 68.3269 66.5685 55 50 55C33.4315 55 20 68.3269 20 85" stroke="#9CA3AF" stroke-width="4"/>
    </svg>
  `)}`,
  white: `data:image/svg+xml;base64,${btoa(`
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#F3F4F6" stroke="#7442d6" stroke-width="4"/>
      <path d="M50 55C58.2843 55 65 48.2843 65 40C65 31.7157 58.2843 25 50 25C41.7157 25 35 31.7157 35 40C35 48.2843 41.7157 55 50 55Z" fill="#6B7280"/>
      <path d="M80 85C80 68.3269 66.5685 55 50 55C33.4315 55 20 68.3269 20 85" stroke="#6B7280" stroke-width="4"/>
    </svg>
  `)}`,
  black: `data:image/svg+xml;base64,${btoa(`
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#1F2937" stroke="#7442d6" stroke-width="4"/>
      <path d="M50 55C58.2843 55 65 48.2843 65 40C65 31.7157 58.2843 25 50 25C41.7157 25 35 31.7157 35 40C35 48.2843 41.7157 55 50 55Z" fill="#9CA3AF"/>
      <path d="M80 85C80 68.3269 66.5685 55 50 55C33.4315 55 20 68.3269 20 85" stroke="#9CA3AF" stroke-width="4"/>
    </svg>
  `)}`,
  purple: `data:image/svg+xml;base64,${btoa(`
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="#7442d6" stroke="#7442d6" stroke-width="4"/>
      <path d="M50 55C58.2843 55 65 48.2843 65 40C65 31.7157 58.2843 25 50 25C41.7157 25 35 31.7157 35 40C35 48.2843 41.7157 55 50 55Z" fill="#F3F4F6"/>
      <path d="M80 85C80 68.3269 66.5685 55 50 55C33.4315 55 20 68.3269 20 85" stroke="#F3F4F6" stroke-width="4"/>
    </svg>
  `)}`
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