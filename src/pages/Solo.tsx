import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-hot-toast'
import '../styles/profile.css'

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Info Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Column 1: Avatar */}
          <div className="w-32 mx-auto md:mx-0">
            <img 
              src={`/avatars/${user?.profilePhoto || 'gray-solo-av.png'}`}
              alt={`${user?.username}'s profile`}
              className="profile-avatar"
            />
          </div>

          {/* Column 2: User Info */}
          <div className="profile-info text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">@{user?.username}</h1>
            <div className="profile-field">
              <span className="profile-field-label">Home Gym</span>
              <span className="profile-field-value">{user?.homeGym || 'Movement Gowanus'}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field-label">Joined</span>
              <span className="profile-field-value">
                {new Date(user?.memberSince || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  year: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Button Row */}
        <div className="profile-buttons">
          <button 
            className="btn bg-purple-600 text-white rounded-lg"
            onClick={() => navigate('/settings')}
          >
            Edit
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