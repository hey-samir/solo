import React, { FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

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

// Fetch actual data from the API
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

  if (userLoading || statsLoading) {
    return <div className="loading-spinner">Loading...</div>
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-red-600">User not found</h1>
      </div>
    )
  }

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile/@${user.username}`
    navigator.clipboard.writeText(profileUrl)
    // TODO: Add toast notification for copy success
  }

  return (
    <div className="container">
      <div className="profile-card p-4">
        {/* Profile Header */}
        <div className="d-flex align-items-center mb-4">
          <div className="profile-avatar me-3">
            <img 
              src="/assets/solo-purple.png" 
              alt="Profile"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div>
            <div className="profile-field">
              <label className="text-muted">Name</label>
              <div className="profile-text">{user.name}</div>
            </div>
            <div className="profile-field">
              <label className="text-muted">Username</label>
              <div className="profile-text">@{user.username}</div>
            </div>
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
            <button 
              className="btn btn-solo-purple flex-grow-1"
              onClick={handleShare}
            >
              <i className="material-icons">qr_code_2</i>
              <span>Share</span>
            </button>
            <button className="btn btn-secondary flex-grow-1">
              <i className="material-icons">logout</i>
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="row g-3">
          <div className="col-4">
            <div className="card kpi-card h-100 text-center p-3">
              <div className="metric-value">{stats?.totalAscents || 0}</div>
              <div className="metric-label text-muted">Total Ascents</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card kpi-card h-100 text-center p-3">
              <div className="metric-value">{stats?.avgGrade || '--'}</div>
              <div className="metric-label text-muted">Avg Grade</div>
            </div>
          </div>
          <div className="col-4">
            <div className="card kpi-card h-100 text-center p-3">
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