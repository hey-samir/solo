import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/ui/card'
import { toast } from 'react-hot-toast'

const Solo: FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
    totalAscents: 0,
    avgGrade: '--',
    totalPoints: 0
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="bg-opacity-0 p-6 rounded-lg">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <img 
              src={user?.profilePhoto || '/assets/avatars/purple-solo.png'}
              alt={`${user?.username}'s profile`}
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-600"
            />
            <button 
              className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {/* TODO: Implement photo upload */}}
            >
              <i className="material-icons text-white text-xl">photo_camera</i>
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl font-bold mb-1">{user?.displayName || user?.username}</h1>
            <p className="text-gray-400 mb-3">@{user?.username}</p>
            <div className="flex flex-col gap-2">
              <p className="text-gray-300">
                <i className="material-icons align-middle mr-2 text-purple-500">location_on</i>
                {user?.gym?.name || 'No gym selected'}
              </p>
              <p className="text-gray-300">
                <i className="material-icons align-middle mr-2 text-purple-500">calendar_today</i>
                Member since {user?.memberSince ? new Date(user.memberSince).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats?.totalAscents || 0}</div>
            <div className="text-gray-400 text-sm">Total Ascents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats?.avgGrade || '--'}</div>
            <div className="text-gray-400 text-sm">Average Grade</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats?.totalPoints || 0}</div>
            <div className="text-gray-400 text-sm">Total Points</div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <button 
            onClick={handleLogout}
            className="w-full btn btn-solo-purple text-white py-3 rounded-lg"
          >
            <i className="material-icons align-middle mr-2">logout</i>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Solo
