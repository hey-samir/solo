import React, { FC, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

interface User {
  id: number
  username: string
  profilePhoto: string | null
  memberSince: string
  gymId: number | null
}

interface Stats {
  totalAscents: number
  totalPoints: number
  avgGrade: string
}

const Profile: FC = () => {
  const { username } = useParams()
  const isOwnProfile = !username // If no username provided, viewing own profile

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['user', username],
    queryFn: async () => {
      const response = await client.get(`/user/${username || 'me'}`)
      return response.data
    },
    enabled: !!username || isOwnProfile
  })

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['user-stats', username],
    queryFn: async () => {
      const response = await client.get(`/user/${username || 'me'}/stats`)
      return response.data
    },
    enabled: !!user
  })

  if (userLoading || statsLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600">User not found</h1>
      </div>
    )
  }

  return (
    <div className="profile-section">
      <div className="text-center mb-8">
        <img
          src={user.profilePhoto || '/default-avatar.svg'}
          alt={`${user.username}'s profile`}
          className="w-32 h-32 rounded-full mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
        <p className="text-gray-600">Member since {new Date(user.memberSince).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats-card">
          <div className="stats-value">{stats?.totalAscents || 0}</div>
          <div className="stats-label">Total Ascents</div>
        </div>
        <div className="stats-card">
          <div className="stats-value">{stats?.avgGrade || '--'}</div>
          <div className="stats-label">Average Grade</div>
        </div>
        <div className="stats-card">
          <div className="stats-value">{stats?.totalPoints || 0}</div>
          <div className="stats-label">Total Points</div>
        </div>
      </div>
    </div>
  )
}

export default Profile