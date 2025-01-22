import React, { FC } from 'react'
import { useQuery } from '@tanstack/react-query'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

interface Route {
  id: number
  routeId: string
  color: string
  grade: string
  rating: number | null
  dateSet: string
}

const Sends: FC = () => {
  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: async () => {
      const response = await client.get('/routes')
      return response.data
    }
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!routes?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="section-title">Available Routes</h1>
        <p className="text-center text-gray-600 mt-8">
          No routes available in your gym yet.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="section-title">Available Routes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <div key={route.id} className="card">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-900">
                Grade {route.grade}
              </span>
              <span 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: route.color }}
                title={route.color}
              />
            </div>
            <div className="text-sm text-gray-600">
              <p>Route ID: {route.routeId}</p>
              <p>Set on: {new Date(route.dateSet).toLocaleDateString()}</p>
              {route.rating && (
                <p>Rating: {route.rating}/5</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sends