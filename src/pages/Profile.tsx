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
  profilePhoto: "/static/images/avatars/purple-solo.png",
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

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    // TODO: Implement save functionality
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="profile-card">
        <div className="card-body">
          <div className="row">
            {/* Avatar Column */}
            <div className="col-12 col-md-3">
              <div className="profile-photo-container">
                <img
                  src={user.profilePhoto || '/static/images/avatars/purple-solo.png'}
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
            <div className="col-12 col-md-9">
              <div className="profile-fields">
                <div className="field-row">
                  <label className="form-label">Name</label>
                  <div className="field-content">
                    {isEditing ? (
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={user.name}
                      />
                    ) : (
                      <span className="profile-text">{user.name}</span>
                    )}
                  </div>
                </div>

                <div className="field-row">
                  <label className="form-label">Username</label>
                  <div className="field-content">
                    <span className="profile-text">@{user.username}</span>
                  </div>
                </div>

                <div className="field-row">
                  <label className="form-label">Gym</label>
                  <div className="field-content">
                    {isEditing ? (
                      <select className="form-select" defaultValue={user.gymId?.toString()}>
                        <option value="">Select a gym</option>
                        <option value={user.gymId?.toString()}>{user.gym?.name}</option>
                      </select>
                    ) : (
                      <span className="profile-text">
                        {user.gym?.name || 'No gym selected'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="field-row">
                  <label className="form-label">Joined</label>
                  <div className="field-content">
                    <span className="profile-text">
                      {new Date(user.memberSince).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Full Width */}
          {isOwnProfile && (
            <div className="row mt-4">
              <div className="col-12">
                <div className="profile-actions">
                  {isEditing ? (
                    <div className="save-mode-buttons w-100">
                      <div className="d-flex gap-2">
                        <button onClick={handleSave} className="btn btn-solo-purple flex-grow-1">
                          <i className="material-icons me-2">save</i>
                          <span>Save</span>
                        </button>
                        <button onClick={handleCancel} className="btn btn-negative flex-grow-1">
                          <i className="material-icons me-2">close</i>
                          <span>Back</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="edit-mode-buttons d-flex gap-2 w-100">
                      <button onClick={handleEdit} className="btn btn-solo-purple flex-grow-1">
                        <i className="material-icons me-2">edit</i>
                        <span>Edit</span>
                      </button>
                      <button className="btn btn-solo-purple flex-grow-1">
                        <i className="material-icons me-2">qr_code_2</i>
                        <span>Share</span>
                      </button>
                      <button className="btn btn-negative flex-grow-1">
                        <i className="material-icons me-2">logout</i>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="row g-3 mt-4">
            <div className="col-12 col-sm-4">
              <div className="feature-card kpi-card h-100">
                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <div className="metric-value">{stats?.totalAscents || 0}</div>
                  <div className="metric-label">Total Ascents</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="feature-card kpi-card h-100">
                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <div className="metric-value">{stats?.avgGrade || '--'}</div>
                  <div className="metric-label">Avg Grade</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className="feature-card kpi-card h-100">
                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <div className="metric-value">{stats?.totalPoints || 0}</div>
                  <div className="metric-label">Total Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile