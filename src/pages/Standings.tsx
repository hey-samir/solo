import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { ServerError } from './ErrorPage'
import type { Standing } from '../types'

const Standings: FC = () => {
  const [cacheInfo, setCacheInfo] = useState<{
    isFromCache: boolean
    timestamp: string | null
  }>({
    isFromCache: false,
    timestamp: null
  })

  const { data: leaderboard, isLoading, error } = useQuery<Standing[], AxiosError>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      try {
        console.log('[Standings] Fetching leaderboard data...')
        const response = await client.get('/api/leaderboard') 
        console.log('[Standings] Raw response:', response)

        if (!response.data) {
          console.error('[Standings] No data received from API')
          throw new Error('No data received from API')
        }

        console.log('[Standings] Response data:', response.data)

        const timestamp = response.headers?.['x-cache-timestamp'] as string || null
        const isFromCache = response.headers?.['x-data-source'] === 'cache'
        setCacheInfo({ isFromCache, timestamp })

        if (!Array.isArray(response.data)) {
          console.error('[Standings] Invalid data format:', response.data)
          throw new Error('Invalid leaderboard data format')
        }

        const validatedData = response.data.map((entry: any) => ({
          ...entry,
          rank: entry.rank || 0,
          burns: entry.burns || 0,
          grade: entry.grade || 'N/A',
          points: entry.points || 0
        }))

        return validatedData
      } catch (error) {
        console.error('[Standings] Error fetching leaderboard:', error)
        if (error instanceof Error) {
          console.error('[Standings] Error details:', error.message)
          if ('response' in error) {
            console.error('[Standings] Response error:', (error as any).response?.data)
          }
        }
        throw error
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000 
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    console.error('[Standings] Rendering error state:', error)
    const errorMessage = (error as any)?.response?.data?.message || 'Failed to load standings'
    return <ServerError code={500} message={errorMessage} />
  }

  if (!leaderboard || !Array.isArray(leaderboard)) {
    console.error('[Standings] Invalid leaderboard data:', leaderboard)
    return <ServerError code={500} message="Invalid standings data" />
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto px-2 py-6">
      <h1 className="text-2xl font-bold mb-4">Standings</h1>

      {cacheInfo.isFromCache && (
        <div className="alert alert-info mb-4 w-full">
          <span className="material-icons align-middle">access_time</span>
          <span>Viewing cached standings</span>
          {cacheInfo.timestamp && (
            <span className="ms-2 text-muted">
              Last updated: {new Date(cacheInfo.timestamp).toLocaleString()}
            </span>
          )}
        </div>
      )}

      <div className="bg-bg-card rounded-lg shadow-lg w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="border-b border-bg-primary">
                <th className="py-2 px-2 text-purple-400 w-10 text-center">#</th>
                <th className="py-2 px-2 text-purple-400">Username</th>
                <th className="py-2 px-2 text-purple-400 w-14 text-center">Burns</th>
                <th className="py-2 px-2 text-purple-400 w-14 text-center">Grade</th>
                <th className="py-2 px-2 text-purple-400 w-14 text-center">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.username} className="border-b border-bg-primary">
                  <td className="py-2 px-2 text-center">
                    {entry.rank <= 3 ? (
                      <span className="material-icons">
                        looks_{entry.rank === 1 ? 'one' : entry.rank === 2 ? 'two' : 'three'}
                      </span>
                    ) : (
                      entry.rank
                    )}
                  </td>
                  <td className="py-2 px-2">{entry.username}</td>
                  <td className="py-2 px-2 text-center">{entry.burns}</td>
                  <td className="py-2 px-2 text-center">{entry.grade}</td>
                  <td className="py-2 px-2 text-center font-medium">{entry.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Standings