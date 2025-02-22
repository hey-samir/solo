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

  const { data: leaderboard, isLoading, error } = useQuery<Standing[]>({
    queryKey: ['standings'],
    queryFn: async () => {
      try {
        const response = await client.get('/api/standings')

        // Update cache info
        const timestamp = response.headers['x-cache-timestamp'] as string || null
        const isFromCache = response.headers['x-data-source'] === 'cache'
        setCacheInfo({ isFromCache, timestamp })

        // Validate and transform the response data
        if (!response.data || !Array.isArray(response.data)) {
          return []
        }

        return response.data.map((entry: any, index: number) => ({
          userId: entry.userId || 0,
          username: entry.username || 'Anonymous',
          burns: entry.burns || 0,
          grade: entry.grade || 'N/A',
          points: entry.points || 0,
          rank: entry.rank || index + 1
        }))
      } catch (err) {
        console.error('Failed to fetch standings:', err)
        throw err
      }
    },
    retry: 1,
    staleTime: 60000 // Cache for 1 minute
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    const axiosError = error as AxiosError
    return (
      <ServerError 
        code={axiosError.response?.status || 500}
        message={
          (axiosError.response?.data as any)?.message || 
          'Failed to load standings'
        }
      />
    )
  }

  if (!leaderboard?.length) {
    return (
      <div className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Standings</h1>
        <div className="text-center text-gray-400 py-8">
          No standings data available yet.
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Standings</h1>

      {cacheInfo.isFromCache && (
        <div className="mb-4 text-sm text-gray-400">
          <span className="material-icons align-middle mr-1">access_time</span>
          Viewing cached standings
          {cacheInfo.timestamp && (
            <span className="ml-2">
              Last updated: {new Date(cacheInfo.timestamp).toLocaleString()}
            </span>
          )}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-3 text-purple-400 text-center w-12">#</th>
                <th className="py-3 px-3 text-purple-400 text-left">Climber</th>
                <th className="py-3 px-3 text-purple-400 text-center">Burns</th>
                <th className="py-3 px-3 text-purple-400 text-center">Grade</th>
                <th className="py-3 px-3 text-purple-400 text-center">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr 
                  key={entry.userId} 
                  className="border-b border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="py-3 px-3 text-center">
                    {entry.rank <= 3 ? (
                      <span className="material-symbols-outlined">
                        counter_{entry.rank}
                      </span>
                    ) : (
                      entry.rank
                    )}
                  </td>
                  <td className="py-3 px-3">{entry.username}</td>
                  <td className="py-3 px-3 text-center">{entry.burns}</td>
                  <td className="py-3 px-3 text-center">{entry.grade}</td>
                  <td className="py-3 px-3 text-center font-medium">
                    {entry.points}
                  </td>
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