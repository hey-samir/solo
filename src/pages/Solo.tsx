import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
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
    burns: 0,
    avgGrade: '--',
    totalPoints: 0
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="bg-opacity-0 p-6 rounded-lg">
        {/* Profile Info Section */}
        <div className="flex gap-6 mb-8">
          {/* Column 1: Avatar */}
          <div className="w-32">
            <img 
              src={user?.profilePhoto || '/assets/avatars/gray-solo-av.png'}
              alt={`${user?.username}'s profile`}
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-600"
            />
          </div>

          {/* Column 2: User Info */}
          <div className="flex-grow">
            <h1 className="text-2xl font-bold mb-3">@{user?.username}</h1>
            <div className="flex flex-col gap-2">
              <p className="text-gray-300">
                <i className="material-icons align-middle mr-2 text-purple-500">location_on</i>
                {user?.homeGym || 'Movement Gowanus'}
              </p>
              <p className="text-gray-300">
                <i className="material-icons align-middle mr-2 text-purple-500">calendar_today</i>
                Joined {new Date(user?.memberSince || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  year: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Button Row */}
        <div className="flex gap-3 mb-8">
          <button 
            className="flex-1 btn bg-purple-600 text-white px-4 py-3 rounded-lg"
            onClick={() => navigate('/settings')}
          >
            <i className="material-icons mr-2">edit</i>
            Edit Profile
          </button>
          <button 
            className="flex-1 btn bg-purple-600 text-white px-4 py-3 rounded-lg"
            onClick={() => {
              const profileUrl = `${window.location.origin}/solo/${user?.username}`
              navigator.clipboard.writeText(profileUrl)
              toast.success('Profile link copied to clipboard')
            }}
          >
            <i className="material-icons mr-2">share</i>
            Share Profile
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 btn bg-gray-600 text-white px-4 py-3 rounded-lg"
          >
            <i className="material-icons mr-2">logout</i>
            Logout
          </button>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold">{stats.burns}</div>
            <div className="text-gray-400 text-sm">Burns</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold">{stats.avgGrade}</div>
            <div className="text-gray-400 text-sm">Average Grade</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <div className="text-3xl font-bold">{stats.totalPoints}</div>
            <div className="text-gray-400 text-sm">Total Points</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Solo