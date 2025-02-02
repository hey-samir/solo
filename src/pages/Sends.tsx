import React, { FC, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import Error from '../components/Error'

interface Route {
  id: number
  color: string
  grade: string
  wall_sector: string
  anchor_number: number
}

interface SendFormData {
  route_id: number
  tries: number
  status: boolean
  rating: number
  notes: string
}

// Color to hex mapping for route colors
const colorToHex: Record<string, string> = {
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

// Points calculation function
const calculatePoints = (grade: string, rating: number, status: boolean, tries: number): number => {
  if (!grade) return 0;
  const [_, mainGrade, subGrade] = grade.match(/5\.(\d+)([a-d])?/) || [null, '0', ''];

  const basePoints: Record<string, number> = {
    '5': 50, '6': 60, '7': 70, '8': 80, '9': 100, '10': 150,
    '11': 200, '12': 300, '13': 400, '14': 500, '15': 600
  }

  const subGradeMultiplier: Record<string, number> = {
    'a': 1, 'b': 1.1, 'c': 1.2, 'd': 1.3
  }

  const base = (basePoints[mainGrade] || 0) * (subGradeMultiplier[subGrade] || 1);
  const starMultiplier = Math.max(0.1, rating / 3);
  const statusMultiplier = status ? 1 : 0.5;
  const triesMultiplier = Math.max(0.1, 1 / Math.sqrt(tries));

  return Math.round(base * starMultiplier * statusMultiplier * triesMultiplier);
}

const Sends: FC = () => {
  const [formData, setFormData] = useState<SendFormData>({
    route_id: 0,
    tries: 1,
    status: true,
    rating: 3,
    notes: ''
  })

  const { data: routes, isLoading, error } = useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: async () => {
      try {
        const response = await client.get('/api/routes')
        if (!response.data) {
          throw new Error('No data received from server')
        }
        return Array.isArray(response.data) ? response.data : []
      } catch (err: any) {
        console.error('Error fetching routes:', err)
        throw new Error(err.response?.data?.message || 'Failed to fetch routes')
      }
    }
  })

  const sendMutation = useMutation({
    mutationFn: async (data: SendFormData) => {
      return await client.post('/api/climbs', data)
    },
    onSuccess: () => {
      // Reset form and show success message
      setFormData({
        route_id: 0,
        tries: 1,
        status: true,
        rating: 3,
        notes: ''
      })
    }
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <Error message={(error as Error).message} type="page" />
  }

  const routesArray = Array.isArray(routes) ? routes : [];
  const selectedRoute = routesArray.find(route => route.id === formData.route_id);
  const points = selectedRoute 
    ? calculatePoints(selectedRoute.grade, formData.rating, formData.status, formData.tries)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card">
        <div className="card-body p-0">
          <form onSubmit={(e) => {
            e.preventDefault()
            sendMutation.mutate(formData)
          }} className="w-100">
            <table className="table table-form w-100">
              <tbody>
                <tr>
                  <td className="form-label-cell">
                    <label className="form-label required-field">Route</label>
                  </td>
                  <td className="form-input-cell">
                    <select 
                      className="form-select form-select-lg custom-select"
                      value={formData.route_id || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        route_id: Number(e.target.value) 
                      }))}
                      required
                    >
                      <option value="">Select a route</option>
                      {routesArray.map(route => (
                        <option 
                          key={route.id} 
                          value={route.id}
                          className="route-option"
                        >
                          {route.wall_sector} - {route.anchor_number} - {route.color} {route.grade}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td className="form-label-cell">
                    <label className="form-label required-field">Tries</label>
                  </td>
                  <td className="form-input-cell">
                    <div className="d-flex align-items-center gap-3">
                      <input 
                        type="range"
                        min="1"
                        max="10"
                        value={formData.tries}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          tries: Number(e.target.value) 
                        }))}
                        className="form-range"
                      />
                      <span className="text-white">{formData.tries}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="form-label-cell">
                    <label className="form-label required-field">Status</label>
                  </td>
                  <td className="form-input-cell">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input custom-switch"
                        type="checkbox"
                        role="switch"
                        checked={formData.status}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          status: e.target.checked 
                        }))}
                      />
                      <label className="form-check-label">
                        {formData.status ? 'Sent' : 'Attempted'}
                      </label>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="form-label-cell">
                    <label className="form-label required-field">Stars</label>
                  </td>
                  <td className="form-input-cell">
                    <div className="rating-container">
                      <div className="rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i
                            key={star}
                            className={`rating-star bi bi-star-fill ${star <= formData.rating ? 'active' : ''}`}
                            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="form-label-cell">
                    <label className="form-label">Notes</label>
                  </td>
                  <td className="form-input-cell">
                    <textarea 
                      className="form-control form-control-lg"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        notes: e.target.value 
                      }))}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="px-3 pb-3 w-100">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100"
                disabled={sendMutation.isPending}
              >
                {sendMutation.isPending ? 'Sending...' : formData.status ? 'Send' : 'Log'}
              </button>
              <div className="text-white mt-3 text-center fs-6">
                Points: {points}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Sends