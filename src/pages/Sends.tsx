import { FC, useState } from 'react'
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

const calculatePoints = (grade: string, rating: number, status: boolean, tries: number): number => {
  if (!grade) return 0;
  const gradeMatch = grade.match(/5\.(\d+)([a-d])?/);
  if (!gradeMatch) return 0;

  const [_, mainGrade, subGrade] = gradeMatch;

  const basePoints: Record<string, number> = {
    '5': 50, '6': 60, '7': 70, '8': 80, '9': 100, '10': 150,
    '11': 200, '12': 300, '13': 400, '14': 500, '15': 600
  }

  const subGradeMultiplier: Record<string, number> = {
    'a': 1, 'b': 1.1, 'c': 1.2, 'd': 1.3
  }

  const base = (basePoints[mainGrade] || 0) * (subGradeMultiplier[subGrade?.toLowerCase()] || 1);
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

  const { data: routesData, isLoading, error, refetch } = useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: async () => {
      const response = await client.get('/api/routes')
      return response.data
    }
  })

  // Ensure routes is always a properly typed array
  const routes = Array.isArray(routesData) ? routesData : [];

  const sendMutation = useMutation({
    mutationFn: async (data: SendFormData) => {
      return await client.post('/api/climbs', data)
    },
    onSuccess: () => {
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
    console.error('Routes fetch error:', error)
    return (
      <Error 
        message="Failed to load routes" 
        type="page"
        retry={() => refetch()}
      />
    )
  }

  const selectedRoute = routes.find(route => route.id === formData.route_id)
  const points = selectedRoute 
    ? calculatePoints(selectedRoute.grade, formData.rating, formData.status, formData.tries)
    : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.route_id === 0) {
      return
    }
    sendMutation.mutate(formData)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card">
        <div className="card-body p-0">
          <form onSubmit={handleSubmit} className="w-100">
            <div className="p-4 space-y-4">
              <div className="mb-4">
                <label className="form-label required-field">Route</label>
                <select 
                  className="form-select form-select-lg"
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
                      {route.wall_sector} - {route.anchor_number} - {route.color} {route.grade}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label required-field">Tries</label>
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
              </div>

              <div className="mb-4">
                <label className="form-label required-field">Status</label>
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input"
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
              </div>

              <div className="mb-4">
                <label className="form-label required-field">Stars</label>
                <div className="rating d-flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`bi bi-star${star <= formData.rating ? '-fill' : ''} fs-4 cursor-pointer`}
                      onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label">Notes</label>
                <textarea 
                  className="form-control"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                />
              </div>

              <button 
                type="submit" 
                className="btn bg-solo-purple hover:bg-solo-purple-light text-white w-100"
                disabled={sendMutation.isPending || formData.route_id === 0}
              >
                {sendMutation.isPending ? 'Sending...' : formData.status ? 'Send' : 'Log'}
              </button>

              <div className="text-center mt-3">
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