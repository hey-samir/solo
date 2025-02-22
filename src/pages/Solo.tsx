import React, { FC, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'
import { Input } from '../components/ui/input'
import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

// Import avatars directly like in Navbar
import graySoloAvatar from '@/assets/images/avatars/gray-solo-av.png'
import whiteSoloAvatar from '@/assets/images/avatars/white-solo-av.png'
import blackSoloAvatar from '@/assets/images/avatars/black-solo-av.png'
import purpleSoloAvatar from '@/assets/images/avatars/purple-solo-av.png'

// Avatar mapping with imported assets
const avatarMap = {
  gray: graySoloAvatar,
  white: whiteSoloAvatar,
  black: blackSoloAvatar,
  purple: purpleSoloAvatar
} as const

type AvatarColor = keyof typeof avatarMap

interface UserStats {
  burns: number
  avgGrade: string
  totalPoints: number
}

const Solo: FC = () => {
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || '')
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarColor>('gray')

  // Fetch user stats
  const { data: stats = { burns: 0, avgGrade: '--', totalPoints: 0 } } = useQuery<UserStats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await client.get('/api/user/me/stats')
      return response.data
    },
    retry: false
  })

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/sign-in')
    } catch (error) {
      console.error('Logout failed:', error)
      toast.error('Failed to logout')
    }
  }

  const handleUpdateProfile = async () => {
    try {
      // Update the user's metadata using Clerk
      await user?.update({
        username: username,
        publicMetadata: {
          ...user?.publicMetadata,
          profilePhoto: selectedAvatar
        }
      })
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    }
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Solo</h1>

      <div className="max-w-4xl mx-auto">
        {/* Profile Table Layout */}
        <div className="flex items-start gap-8">
          {/* Column 1: Avatar */}
          <div className="w-32 flex-shrink-0">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(avatarMap) as [AvatarColor, string][]).map(([color, src]) => (
                  <button
                    key={color}
                    onClick={() => setSelectedAvatar(color)}
                    className={`relative rounded-full overflow-hidden border-2 ${
                      selectedAvatar === color ? 'border-purple-600' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${color} avatar`}
                      className="w-full h-auto"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <img 
                src={avatarMap[selectedAvatar]}
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
                      <span className="profile-field-value">
                        {user?.publicMetadata?.homeGym || 'Movement Gowanus'}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-2">
                    <div className="profile-field">
                      <span className="profile-field-label">Joined</span>
                      <span className="profile-field-value">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
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