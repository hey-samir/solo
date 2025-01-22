import React, { FC } from 'react'
import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

interface Stats {
  totalAscents: number
  totalSends: number
  totalPoints: number
  avgGrade: string
}

const Stats: FC = () => {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await client.get('/user/me/stats')
      return response.data
    }
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="section-title">Your Climbing Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="stats-value">{stats?.totalAscents || 0}</div>
          <div className="stats-label">Total Ascents</div>
        </div>

        <div className="stats-card">
          <div className="stats-value">{stats?.totalSends || 0}</div>
          <div className="stats-label">Successful Sends</div>
        </div>

        <div className="stats-card">
          <div className="stats-value">{stats?.totalPoints || 0}</div>
          <div className="stats-label">Total Points</div>
        </div>

        <div className="stats-card">
          <div className="stats-value">{stats?.avgGrade || '--'}</div>
          <div className="stats-label">Average Grade</div>
        </div>
      </div>
    </div>
  )
}

export default Stats