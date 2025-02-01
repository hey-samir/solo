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
  totalPoints: number
  avgGrade: string
}

// Development mock data
const mockUser: User = {
  id: 1,
  username: "DemoUser",
  name: "Demo User",
  profilePhoto: null,
  memberSince: new Date().toISOString(),
  gymId: 1,
  gym: {
    name: "Movement Gowanus"
  }
}

const mockStats: Stats = {
  totalAscents: 42,
  totalPoints: 1337,
  avgGrade: "V5"
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
    <div className="container-fluid profile-container px-0">
      <div className="row justify-content-center g-0">
        <div className="col-12">
          <div className="profile-card">
            <div className="card-body p-0">
              <div className="row">
                {/* Avatar Column */}
                <div className="col-12 col-md-3">
                  <div className="profile-photo-container mb-3">
                    <img
                      src={user.profilePhoto || '/default-avatar.svg'}
                      alt={`${user.username}'s profile`}
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
                    <div className="field-row mb-3">
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

                    <div className="field-row mb-3">
                      <label className="form-label">Username</label>
                      <div className="field-content">
                        <span className="profile-text">@{user.username}</span>
                      </div>
                    </div>

                    <div className="field-row mb-3">
                      <label className="form-label">Gym</label>
                      <div className="field-content">
                        {isEditing ? (
                          <select className="form-select" defaultValue={user.gymId || ''}>
                            <option value="">Select a gym</option>
                            <option value={user.gymId}>{user.gym?.name}</option>
                          </select>
                        ) : (
                          <span className="profile-text">
                            {user.gym?.name || 'No gym selected'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="field-row mb-3">
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

                  {isOwnProfile && (
                    <div className="profile-actions mt-4 d-flex gap-3">
                      {isEditing ? (
                        <div className="save-mode-buttons">
                          <div className="d-flex gap-2">
                            <button onClick={handleSave} className="btn btn-primary">
                              <i className="material-icons me-2">save</i>
                              <span>Save</span>
                            </button>
                            <button onClick={handleCancel} className="btn btn-negative">
                              <i className="material-icons me-2">close</i>
                              <span>Back</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="edit-mode-buttons">
                          <button onClick={handleEdit} className="btn btn-primary edit-toggle">
                            <i className="material-icons me-2">edit</i>
                            <span>Edit</span>
                          </button>
                          <button className="btn btn-primary ms-2">
                            <i className="material-icons me-2">qr_code_2</i>
                            <span>Share</span>
                          </button>
                          <button className="btn btn-negative ms-2">
                            <i className="material-icons me-2">logout</i>
                            <span>Logout</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* KPI Cards */}
                  <div className="row g-3 mt-4">
                    <div className="col-12 col-sm-4">
                      <div className="metric-card p-3">
                        <div className="metric-value">{stats?.totalAscents || 0}</div>
                        <div className="metric-label">Total Ascents</div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-4">
                      <div className="metric-card p-3">
                        <div className="metric-value">{stats?.avgGrade || '--'}</div>
                        <div className="metric-label">Avg Grade</div>
                      </div>
                    </div>
                    <div className="col-12 col-sm-4">
                      <div className="metric-card p-3">
                        <div className="metric-value">{stats?.totalPoints || 0}</div>
                        <div className="metric-label">Total Points</div>
                      </div>
                    </div>
                  </div>
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