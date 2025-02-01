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
  profilePhoto: "https://ui-avatars.com/api/?name=Solo&background=7442d6&color=fff",
  memberSince: "2025-01-01T00:00:00.000Z",
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
  const [isEditing, setIsEditing] = useState(false)

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

  // Helper function to generate fallback avatar URL
  const getAvatarUrl = (user: User) => {
    if (user.profilePhoto) return user.profilePhoto;
    // Generate a UI Avatar with user's name and Solo brand color
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7442d6&color=fff`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="profile-card">
        <div className="row">
          {/* Avatar Column */}
          <div className="col-md-3 col-12 mb-4 mb-md-0">
            <div className="profile-photo-container">
              <img
                src={getAvatarUrl(user)}
                alt={`${user.name}'s profile`}
                className="profile-photo"
              />
              {isOwnProfile && (
                <div className="edit-photo-icon">
                  <i className="material-icons">edit</i>
                </div>
              )}
            </div>
          </div>

          {/* Info Column */}
          <div className="col-md-9 col-12">
            <div className="profile-fields">
              <div className="field-row">
                <label className="form-label">Name</label>
                <div className="profile-text">{user.name}</div>
              </div>

              <div className="field-row">
                <label className="form-label">Username</label>
                <div className="profile-text">@{user.username}</div>
              </div>

              <div className="field-row">
                <label className="form-label">Gym</label>
                <div className="profile-text">
                  {user.gym?.name || 'No gym selected'}
                </div>
              </div>

              <div className="field-row">
                <label className="form-label">Joined</label>
                <div className="profile-text">
                  {new Date(user.memberSince).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isOwnProfile && (
          <div className="profile-actions">
            <div className="d-flex gap-2">
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
          </div>
        )}

        {/* KPI Cards */}
        <div className="row g-3 mt-4">
          <div className="col-md-4 col-12">
            <div className="feature-card kpi-card">
              <div className="metric-value">{stats?.totalAscents || 0}</div>
              <div className="metric-label">Total Ascents</div>
            </div>
          </div>
          <div className="col-md-4 col-12">
            <div className="feature-card kpi-card">
              <div className="metric-value">{stats?.avgGrade || '--'}</div>
              <div className="metric-label">Avg Grade</div>
            </div>
          </div>
          <div className="col-md-4 col-12">
            <div className="feature-card kpi-card">
              <div className="metric-value">{stats?.totalPoints || 0}</div>
              <div className="metric-label">Total Points</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile