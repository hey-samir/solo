import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { ServerError } from '../pages/ErrorPage'
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
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Standings</h1>

      {cacheInfo.isFromCache && (
        <div className="mb-4 text-sm text-text-muted">
          <span className="material-icons align-middle text-base">access_time</span>
          <span className="ml-1">Viewing cached standings</span>
          {cacheInfo.timestamp && (
            <span className="ml-2">
              Last updated: {new Date(cacheInfo.timestamp).toLocaleString()}
            </span>
          )}
        </div>
      )}

      <div className="bg-bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="border-b border-bg-primary">
                <th className="py-3 px-3 text-purple-400 text-center w-8">#</th>
                <th className="py-3 px-3 text-purple-400 text-left min-w-[100px]">Username</th>
                <th className="py-3 px-2 text-purple-400 text-center w-16">Burns</th>
                <th className="py-3 px-2 text-purple-400 text-center w-16">Grade</th>
                <th className="py-3 px-2 text-purple-400 text-center w-16">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.username} className="border-b border-bg-primary">
                  <td className="py-2.5 px-3 text-center">
                    {entry.rank <= 3 ? (
                      <span className="material-symbols-outlined">
                        {entry.rank === 1 ? 'counter_1' : entry.rank === 2 ? 'counter_2' : 'counter_3'}
                      </span>
                    ) : (
                      entry.rank
                    )}
                  </td>
                  <td className="py-2.5 px-3 truncate">{entry.username}</td>
                  <td className="py-2.5 px-2 text-center">{entry.burns}</td>
                  <td className="py-2.5 px-2 text-center">{entry.grade}</td>
                  <td className="py-2.5 px-2 text-center font-medium">{entry.points}</td>
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