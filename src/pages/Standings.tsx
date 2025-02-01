import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import type { Standing } from '../types'

const Standings: FC = () => {
  const [cacheInfo, setCacheInfo] = useState<{
    isFromCache: boolean
    timestamp: string | null
  }>({
    isFromCache: false,
    timestamp: null
  })

  const { data: leaderboard, isLoading, error } = useQuery<Standing[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      try {
        const response: AxiosResponse = await client.get('/api/leaderboard')
        // Check response headers for cache information
        const timestamp = response.headers?.['x-cache-timestamp'] as string || null
        const isFromCache = response.headers?.['x-data-source'] === 'cache'
        setCacheInfo({ isFromCache, timestamp })
        return response.data || [] // Ensure we always return an array
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return [] // Return empty array on error
      }
    }
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="alert alert-danger">Error loading standings</div>
  }

  return (
    <div className="container-fluid px-3">
      <div className="card">
        <div className="card-body p-0">
          {/* Cache indicator */}
          {cacheInfo.isFromCache && (
            <div className="alert alert-info m-2">
              <i className="material-icons align-middle">access_time</i>
              <span>Viewing cached standings</span>
              {cacheInfo.timestamp && (
                <span className="ms-2 text-muted">
                  Last updated: {new Date(cacheInfo.timestamp).toLocaleString()}
                </span>
              )}
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th className="text-center">#</th>
                  <th>Username</th>
                  <th className="text-center">Sends</th>
                  <th className="text-center">Grade</th>
                  <th className="text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {(leaderboard || []).map((entry, index) => (
                  <tr key={entry.username}>
                    <td className="text-center">
                      {index + 1 <= 3 ? (
                        <span className="material-symbols-outlined">
                          counter_{index + 1}
                        </span>
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td>{entry.username}</td>
                    <td className="text-center">{entry.totalSends}</td>
                    <td className="text-center">{entry.avgGrade}</td>
                    <td className="text-center">{entry.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Standings