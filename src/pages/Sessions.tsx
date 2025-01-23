import React, { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

interface Route {
  color: string
  grade: string
}

interface Climb {
  id: number
  routeId: number
  status: boolean
  rating: number
  tries: number
  notes: string | null
  points: number
  createdAt: string
  route: Route
}

interface ClimbsByDate {
  [date: string]: Climb[]
}

type SortKey = 'color' | 'grade' | 'status' | 'tries' | 'rating' | 'points'
type SortDirection = 'asc' | 'desc'

const Sessions: FC = () => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey
    direction: SortDirection
    date: string | null
  }>({
    key: 'color',
    direction: 'asc',
    date: null
  })

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

  const getColorHex = (color: string): string => {
    const colorMap: Record<string, string> = {
      'White': '#FFFFFF',
      'Pink': '#FF69B4',
      'Blue': '#0000FF',
      'Black': '#000000',
      'Orange': '#FFA500',
      'Purple': '#800080',
      'Green': '#008000',
      'Red': '#FF0000',
      'Yellow': '#FFFF00',
      'Teal': '#008080'
    }
    return colorMap[color] || '#CCCCCC'
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

  const sortClimbs = (climbs: Climb[]) => {
    return [...climbs].sort((a, b) => {
      let comparison = 0
      switch (sortConfig.key) {
        case 'color':
          comparison = a.route.color.localeCompare(b.route.color)
          break
        case 'grade':
          comparison = a.route.grade.localeCompare(b.route.grade)
          break
        case 'status':
          comparison = Number(b.status) - Number(a.status)
          break
        case 'tries':
          comparison = a.tries - b.tries
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'points':
          comparison = a.points - b.points
          break
        default:
          return 0
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }

  const handleSort = (key: SortKey, date: string) => {
    setSortConfig(current => ({
      key,
      direction: 
        current.key === key && current.date === date && current.direction === 'asc' 
          ? 'desc' 
          : 'asc',
      date
    }))
  }

  const renderSortIcon = (key: SortKey, date: string) => {
    if (sortConfig.key !== key || sortConfig.date !== date) return null
    return (
      <span className="ml-1">
        {sortConfig.direction === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Climbing Sessions</h1>

      {Object.entries(climbsByDate).map(([date, sessionClimbs]) => (
        <div key={date} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{date}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th 
                    className="px-4 py-2 cursor-pointer" 
                    onClick={() => handleSort('color', date)}
                  >
                    Color {renderSortIcon('color', date)}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer" 
                    onClick={() => handleSort('grade', date)}
                  >
                    Grade {renderSortIcon('grade', date)}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer" 
                    onClick={() => handleSort('status', date)}
                  >
                    Status {renderSortIcon('status', date)}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer" 
                    onClick={() => handleSort('tries', date)}
                  >
                    # Tries {renderSortIcon('tries', date)}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer" 
                    onClick={() => handleSort('rating', date)}
                  >
                    Stars {renderSortIcon('rating', date)}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer" 
                    onClick={() => handleSort('points', date)}
                  >
                    Points {renderSortIcon('points', date)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortClimbs(sessionClimbs).map((climb) => (
                  <tr key={climb.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="flex items-center">
                        <span 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: getColorHex(climb.route.color),
                            border: climb.route.color === 'White' ? '1px solid #ccc' : 'none'
                          }}
                        />
                        {climb.route.color}
                      </div>
                    </td>
                    <td className="px-4 py-2">{climb.route.grade}</td>
                    <td className="px-4 py-2">
                      <span className={`font-medium ${climb.status ? 'text-green-600' : 'text-red-600'}`}>
                        {climb.status ? 'Send' : 'Attempt'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{climb.tries}</td>
                    <td className="px-4 py-2">{climb.rating}/5</td>
                    <td className="px-4 py-2">
                      <span className="text-purple-600 font-medium">
                        {climb.points} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {Object.keys(climbsByDate).length === 0 && (
        <div className="text-center my-8">
          <h4 className="text-xl text-gray-600 mb-4">Enter your first climb to see Sessions</h4>
          <a 
            href="/sends" 
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Sends
          </a>
        </div>
      )}
    </div>
  )
}

export default Sessions