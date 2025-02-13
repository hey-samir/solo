import React, { FC, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { ServerError } from '../components/Error'

interface Route {
  id: number
  color: string
  grade: string
  wall_sector: string
  anchor_number: number
  gym: string
  points: number
  tried_points: number
  average_rating?: number
  active: boolean
}

interface SendFormData {
  route_id: number
  tries: number
  status: boolean
  rating: number
  notes: string
}

const Sends: FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<SendFormData>({
    route_id: 0,
    tries: 1,
    status: true,
    rating: 3,
    notes: ''
  })

  const { data: routesData, isLoading, error: routesError } = useQuery<Route[], AxiosError>({
    queryKey: ['routes'],
    queryFn: async () => {
      try {
        console.log('[Sends] Fetching routes...')
        const response = await client.get('/api/routes?gym=Movement+Gowanus')
        console.log('[Sends] Routes response:', response.data)

        if (!response.data || !Array.isArray(response.data)) {
          console.error('[Sends] Invalid routes data format:', response.data)
          throw new Error('Invalid routes data format')
        }

        return response.data
      } catch (err) {
        console.error('[Sends] Error fetching routes:', err)
        throw err
      }
    },
    retry: 1
  })

  const routes = Array.isArray(routesData) ? routesData.filter(route => route.active) : [];

  const sendMutation = useMutation({
    mutationFn: async (data: SendFormData) => {
      try {
        console.log('[Sends] Submitting send data:', data)
        const response = await client.post('/api/climbs', data)
        console.log('[Sends] Send response:', response.data)
        return response.data
      } catch (err) {
        console.error('[Sends] Error submitting send:', err)
        throw err
      }
    },
    onSuccess: () => {
      console.log('[Sends] Successfully submitted send')
      setFormData({
        route_id: 0,
        tries: 1,
        status: true,
        rating: 3,
        notes: ''
      })
      navigate('/sessions')
    },
    onError: (error: unknown) => {
      console.error('[Sends] Mutation error:', error)
    }
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (routesError) {
    console.error('[Sends] Rendering error state:', routesError)
    if (routesError?.response?.status === 401) {
      navigate('/login')
      return null
    }
    const errorMessage = routesError?.response?.data?.message || 'Failed to load routes'
    return <ServerError code={routesError?.response?.status || 500} message={errorMessage} />
  }

  if (!routes.length) {
    return <ServerError code={404} message="No routes available" />
  }

  const selectedRoute = routes.find(route => route.id === formData.route_id)
  const points = selectedRoute
    ? (formData.status ? selectedRoute.points : selectedRoute.tried_points)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.route_id === 0) {
      return
    }
    try {
      await sendMutation.mutateAsync(formData)
    } catch (err) {
      console.error('[Sends] Error in handleSubmit:', err)
    }
  }

  return (
    <div className="container px-6 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Sends</h1>
      <div className="bg-bg-card rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Two Column Layout */}
            <div className="grid grid-cols-[200px_1fr] gap-4 items-start max-w-2xl mx-auto">
              {/* Route Selection */}
              <label className="text-text-primary font-medium pt-2">Route</label>
              <select
                className="form-select w-full bg-bg-input text-text-primary border-border-default rounded-lg focus:border-solo-purple focus:ring-solo-purple"
                value={formData.route_id || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  route_id: Number(e.target.value)
                }))}
                required
              >
                <option value="">Select a route</option>
                {routes.map(route => (
                  <option
                    key={route.id}
                    value={route.id}
                  >
                    {route.wall_sector} {route.anchor_number} {route.color} {route.grade}
                    {route.average_rating ? ` (${route.average_rating.toFixed(1)}★)` : ''}
                  </option>
                ))}
              </select>

              {/* Tries */}
              <label className="text-text-primary font-medium pt-2">Tries</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.tries}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    tries: Number(e.target.value)
                  }))}
                  className="w-full h-2 bg-bg-kpi-card rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-solo-purple [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-text-primary min-w-[2rem] text-center">{formData.tries}</span>
              </div>

              {/* Status Toggle */}
              <label className="text-text-primary font-medium pt-2">Status</label>
              <div className="flex items-center h-10 space-x-3">
                <div
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.status ? 'bg-solo-purple' : 'bg-gray-600'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, status: !prev.status }))}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.status ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </div>
                <span className="text-text-primary">
                  {formData.status ? 'Sent' : 'Tried'}
                </span>
              </div>

              {/* Star Rating */}
              <label className="text-text-primary font-medium pt-2">Your Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="text-2xl focus:outline-none"
                  >
                    <i className={`material-icons ${
                      star <= formData.rating ? 'text-solo-purple' : 'text-gray-400'
                    }`}>
                      star
                    </i>
                  </button>
                ))}
              </div>

              {/* Notes */}
              <label className="text-text-primary font-medium pt-2">Notes</label>
              <textarea
                className="w-full form-textarea bg-[#2b3245] text-text-primary border-border-default rounded-lg focus:border-solo-purple focus:ring-solo-purple"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
              />

              {/* Points and Submit Button */}
              <div className="col-span-2 flex flex-col items-center space-y-2 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-solo-purple hover:bg-solo-purple-light text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={sendMutation.isPending || formData.route_id === 0}
                >
                  {sendMutation.isPending ? 'Sending...' : formData.status ? 'Send' : 'Log'}
                </button>
                <div className="text-text-primary font-medium">
                  Points: {points}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Sends