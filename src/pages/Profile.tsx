import React, { FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import client from '../api/client'
import { useAuth } from '../hooks/useAuth'
import type { User } from '../types'

interface Stats {
  totalAscents: number
  avgGrade: string
  totalPoints: number
}

const Profile: FC = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  // Remove @ symbol if present in the username
  const cleanUsername = username?.startsWith('@') ? username.slice(1) : username
  const isOwnProfile = !username || (currentUser && currentUser.username === cleanUsername)

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['user', cleanUsername],
    queryFn: async () => {
      try {
        if (!cleanUsername && !isOwnProfile) {
          throw new Error('Username is required')
        }
        const response = await client.get(isOwnProfile ? '/api/users/current' : `/api/users/${cleanUsername}`)
        return response.data
      } catch (error) {
        console.error('Error fetching user:', error)
        throw error
      }
    },
    retry: false,
    enabled: Boolean(cleanUsername) || isOwnProfile,
  })

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['user-stats', cleanUsername],
    queryFn: async () => {
      try {
        if (!user) {
          throw new Error('User data is required')
        }
        const response = await client.get(isOwnProfile ? '/api/users/current/stats' : `/api/users/${cleanUsername}/stats`)
        return response.data
      } catch (error) {
        console.error('Error fetching stats:', error)
        throw error
      }
    },
    retry: false,
    enabled: Boolean(user),
  })

  const handleShare = async () => {
    try {
      const profileUrl = `${window.location.origin}/profile/@${user?.username}`
      await navigator.clipboard.writeText(profileUrl)
      toast.success('Profile link copied to clipboard')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy profile link')
    }
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
      <div className="bg-opacity-0 p-6 rounded-lg">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <img 
              src={user.profilePhoto || '/assets/avatars/purple-solo.png'}
              alt={`${user.username}'s profile`}
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
            <h1 className="text-2xl font-bold mb-1">{user.displayName || user.username}</h1>
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
            <div className="flex items-center gap-3 mt-4 justify-center md:justify-start">
              {isOwnProfile && (
                <button 
                  className="btn btn-solo-purple"
                  onClick={() => navigate('/settings')}
                >
                  <i className="material-icons mr-2">edit</i>
                  Edit Profile
                </button>
              )}
              <button 
                className="btn btn-solo-purple"
                onClick={handleShare}
              >
                <i className="material-icons mr-2">share</i>
                Share Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section - Single Row */}
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
      </div>
    </div>
  )
}

export default Profile