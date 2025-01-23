import React, { FC, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'

interface Route {
  id: number
  color: string
  grade: string
}

interface SendFormData {
  route_id: number
  tries: number
  status: boolean
  rating: number
  notes: string
}

const Sends: FC = () => {
  const [formData, setFormData] = useState<SendFormData>({
    route_id: 0,
    tries: 1,
    status: true,
    rating: 3,
    notes: ''
  })

  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: async () => {
      const response = await client.get('/routes')
      return response.data
    }
  })

  const sendMutation = useMutation({
    mutationFn: async (data: SendFormData) => {
      return await client.post('/climbs', data)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMutation.mutate(formData)
  }

  const handleRatingChange = (newRating: number) => {
    setFormData(prev => ({ ...prev, rating: newRating }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card">
        <div className="card-body p-0">
          <form onSubmit={handleSubmit} className="w-100">
            <table className="table table-form w-100">
              <tbody>
                <tr>
                  <td className="form-label-cell">
                    <label className="form-label required-field">Route</label>
                  </td>
                  <td className="form-input-cell">
                    <select 
                      className="form-select form-select-lg custom-select"
                      value={formData.route_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, route_id: Number(e.target.value) }))}
                      required
                    >
                      <option value="" disabled>Select a route</option>
                      {routes?.map(route => (
                        <option 
                          key={route.id} 
                          value={route.id}
                          className="route-option"
                        >
                          {route.color} {route.grade}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, tries: Number(e.target.value) }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                      />
                      <label className="form-check-label">
                        {formData.status ? 'Sent' : 'Attempt'}
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
                            onClick={() => handleRatingChange(star)}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                {sendMutation.isPending ? 'Sending...' : 'Send'}
              </button>
              <div id="pointsEstimate" className="text-white mt-3 text-center fs-6">
                Points: {formData.status ? formData.rating * 10 : formData.rating * 5}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Sends