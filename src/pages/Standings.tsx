import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError, AxiosResponse } from 'axios'
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
        console.log('Fetching leaderboard data...');
        const response: AxiosResponse = await client.get('/leaderboard')
        console.log('Leaderboard response:', response.data);
        const timestamp = response.headers?.['x-cache-timestamp'] as string || null
        const isFromCache = response.headers?.['x-data-source'] === 'cache'
        setCacheInfo({ isFromCache, timestamp })
        return response.data || []
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
        throw error
      }
    },
    retry: 1
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    console.error('Standings error:', error);
    return <ServerError />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Standings</h1>

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

      <div className="bg-bg-card rounded-lg shadow-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-bg-primary">
                <th className="py-4 px-6 text-purple-400 w-16 text-center">#</th>
                <th className="py-4 px-6 text-purple-400">Username</th>
                <th className="py-4 px-6 text-purple-400 w-24 text-center">Burns</th>
                <th className="py-4 px-6 text-purple-400 w-24 text-center">Grade</th>
                <th className="py-4 px-6 text-purple-400 w-24 text-center">Points</th>
              </tr>
            </thead>
            <tbody>
              {(leaderboard || []).map((entry) => (
                <tr key={entry.username} className="border-b border-bg-primary">
                  <td className="py-4 px-6 text-center">
                    {entry.rank <= 3 ? (
                      <span className="material-symbols-outlined">
                        counter_{entry.rank}
                      </span>
                    ) : (
                      entry.rank
                    )}
                  </td>
                  <td className="py-4 px-6">{entry.username}</td>
                  <td className="py-4 px-6 text-center">{entry.burns}</td>
                  <td className="py-4 px-6 text-center">{entry.grade}</td>
                  <td className="py-4 px-6 text-center font-medium">{entry.points}</td>
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