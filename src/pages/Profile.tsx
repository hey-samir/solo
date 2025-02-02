import React, { FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

interface User {
  id: number
  username: string
  name: string
  profilePhoto: string | null
  memberSince: string
  gymId: number | null
  gym?: {
    name: string
  }
}

interface Stats {
  totalAscents: number
  avgGrade: string
  totalPoints: number
}

const fetchUserData = async (username: string | undefined) => {
  const response = await fetch(`/api/users/${username || 'current'}`)
  if (!response.ok) throw new Error('Failed to fetch user data')
  return response.json()
}

const fetchUserStats = async (username: string | undefined) => {
  const response = await fetch(`/api/users/${username || 'current'}/stats`)
  if (!response.ok) throw new Error('Failed to fetch user stats')
  return response.json()
}

const Profile: FC = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const isOwnProfile = !username

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['user', username],
    queryFn: () => fetchUserData(username),
  })

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['user-stats', username],
    queryFn: () => fetchUserStats(username),
  })

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile/@${user?.username}`
    navigator.clipboard.writeText(profileUrl)
    toast.success('Profile link copied to clipboard')
  }

  if (userLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">User not found</h1>
          <p className="text-gray-400 mt-2">This profile doesn't exist or was deleted</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="p-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <img 
              src={user.profilePhoto || '/assets/avatars/purple-solo.png'}
              alt={`${user.name}'s profile`}
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-600"
            />
            {isOwnProfile && (
              <button 
                className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {/* TODO: Implement photo upload */}}
              >
                <i className="material-icons text-white text-xl">photo_camera</i>
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-2xl font-bold text-white mb-1">{user.name}</h1>
            <p className="text-gray-400 mb-3">@{user.username}</p>
            <div className="flex flex-col gap-2">
              <p className="text-gray-300">
                <i className="material-icons align-middle mr-2 text-purple-500">location_on</i>
                {user.gym?.name || 'No gym selected'}
              </p>
              <p className="text-gray-300">
                <i className="material-icons align-middle mr-2 text-purple-500">calendar_today</i>
                Member since {new Date(user.memberSince).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            {/* Action Buttons */}
            {isOwnProfile ? (
              <div className="flex items-center gap-3 mt-4">
                <button 
                  className="btn btn-solo-purple"
                  onClick={() => navigate('/settings')}
                >
                  <i className="material-icons mr-2">edit</i>
                  Edit Profile
                </button>
                <button 
                  className="btn btn-solo-purple"
                  onClick={handleShare}
                >
                  <i className="material-icons mr-2">share</i>
                  Share Profile
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-solo-purple mt-4"
                onClick={handleShare}
              >
                <i className="material-icons mr-2">share</i>
                Share Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats Section - Single Row */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{stats?.totalAscents || 0}</div>
            <div className="text-gray-400 text-sm">Total Ascents</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{stats?.avgGrade || '--'}</div>
            <div className="text-gray-400 text-sm">Average Grade</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">{stats?.totalPoints || 0}</div>
            <div className="text-gray-400 text-sm">Total Points</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile