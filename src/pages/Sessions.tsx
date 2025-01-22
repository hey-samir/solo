import React, { FC } from 'react'
import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

interface Climb {
  id: number
  routeId: number
  status: boolean
  rating: number
  tries: number
  notes: string
  points: number
  createdAt: string
  route: {
    color: string
    grade: string
  }
}

interface ClimbsByDate {
  [date: string]: Climb[]
}

const Sessions: FC = () => {
  const { data: climbs, isLoading } = useQuery<Climb[]>({
    queryKey: ['climbs'],
    queryFn: async () => {
      const response = await client.get('/climbs')
      return response.data
    }
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  // Group climbs by date
  const climbsByDate = climbs?.reduce((acc: ClimbsByDate, climb) => {
    const date = new Date(climb.createdAt).toLocaleDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(climb)
    return acc
  }, {}) || {}

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="section-title">Your Climbing Sessions</h1>

      {Object.entries(climbsByDate).map(([date, sessionClimbs]) => (
        <div key={date} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{date}</h2>
          <div className="space-y-4">
            {sessionClimbs.map((climb) => (
              <div key={climb.id} className="climb-card">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900">
                      Grade {climb.route.grade}
                    </span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-gray-600">
                      {climb.route.color}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium ${climb.status ? 'text-green-600' : 'text-red-600'}`}>
                      {climb.status ? 'Send' : 'Attempt'}
                    </span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span className="text-purple-600 font-medium">
                      {climb.points} pts
                    </span>
                  </div>
                </div>
                {climb.notes && (
                  <p className="mt-2 text-gray-600 text-sm">{climb.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(climbsByDate).length === 0 && (
        <p className="text-center text-gray-600 mt-8">
          No climbing sessions recorded yet.
        </p>
      )}
    </div>
  )
}

export default Sessions