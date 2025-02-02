import React, { FC, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from '../components/LoadingSpinner'

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

// Development mock data
const mockUser: User = {
  id: 1,
  username: "gosolonyc",
  name: "Solo",
  profilePhoto: null,
  memberSince: "2024-12-01T00:00:00.000Z",
  gymId: 1,
  gym: {
    name: "Movement Gowanus"
  }
}

const mockStats: Stats = {
  totalAscents: 42,
  avgGrade: "V5",
  totalPoints: 1337
}

const Profile: FC = () => {
  const { username } = useParams()
  const isOwnProfile = !username

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['user', username],
    queryFn: async () => mockUser,
    enabled: true
  })

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['user-stats', username],
    queryFn: async () => mockStats,
    enabled: true
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

  // Generate avatar text from name (first letters of first and last name)
  const getAvatarText = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container">
      <div className="profile-card p-4">
        {/* Profile Header */}
        <div className="d-flex align-items-center mb-4">
          <div 
            className="profile-avatar me-3"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'var(--solo-purple)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            {getAvatarText(user.name)}
          </div>
          <div>
            <div className="profile-text">{user.name}</div>
            <div className="profile-text text-muted">@{user.username}</div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-4">
          <div className="profile-field mb-2">
            <label className="text-muted">Gym</label>
            <div>{user.gym?.name || 'No gym selected'}</div>
          </div>
          <div className="profile-field">
            <label className="text-muted">Joined</label>
            <div>
              {new Date(user.memberSince).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isOwnProfile && (
          <div className="d-flex gap-2 mb-4">
            <button className="btn btn-solo-purple flex-grow-1">
              <i className="material-icons">edit</i>
              <span>Edit</span>
            </button>
            <button className="btn btn-solo-purple flex-grow-1">
              <i className="material-icons">qr_code_2</i>
              <span>Share</span>
            </button>
            <button className="btn btn-negative flex-grow-1">
              <i className="material-icons">logout</i>
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="row g-3">
          <div className="col-4">
            <div className="card kpi-card text-center p-3">
              <div className="metric-value">{stats?.totalAscents || 0}</div>
              <div className="metric-label text-muted">Total Ascents</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card kpi-card text-center p-3">
              <div className="metric-value">{stats?.avgGrade || '--'}</div>
              <div className="metric-label text-muted">Avg Grade</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card kpi-card text-center p-3">
              <div className="metric-value">{stats?.totalPoints || 0}</div>
              <div className="metric-label text-muted">Total Points</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile