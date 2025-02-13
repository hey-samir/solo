import React, { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import Error from '../components/Error';
import NotFound from './NotFound';
import { ApiError } from '../types';

interface Attempt {
  route: string;
  tries: number;
  status: 'Sent' | 'Tried';
  stars: number;
  points: number;
}

interface Session {
  id: string;
  userId: number;
  location: string;
  totalTries: number;
  totalSends: number;
  totalPoints: number;
  createdAt: string;
  attempts: Attempt[];
}

interface QueryError extends ApiError {
  shouldShowNotFound?: boolean;
}

const Sessions: FC = () => {
  const { data, isLoading, error, refetch } = useQuery<Session[], QueryError>({
    queryKey: ['sessions'],
    queryFn: async () => {
      try {
        console.log('[Sessions] Making API request to /api/sessions...');
        const response = await client.get('/api/sessions');
        console.log('[Sessions] Response:', response.data);

        if (!response.data) {
          throw { message: 'No data received from server', status: 500 };
        }
        return Array.isArray(response.data) ? response.data : [];
      } catch (err: any) {
        console.error('[Sessions] Error fetching sessions:', err);
        if (err.response?.status === 404) {
          throw {
            message: 'Page not found',
            status: 404,
            shouldShowNotFound: true
          } as QueryError;
        }
        throw {
          message: err.response?.data?.error || 'Failed to load sessions',
          status: err.response?.status || 500
        } as QueryError;
      }
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    if (error.shouldShowNotFound) {
      return <NotFound />;
    }
    return (
      <Error
        message={error.message}
        type="page"
        retry={() => refetch()}
      />
    );
  }

  const sessions = data || [];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    }).replace(',', ' -');
  };

  const formatStars = (stars: number): string => {
    return `${stars}/5`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sessions</h1>

      {sessions.length === 0 ? (
        <div className="text-left my-8">
          <h4 className="text-xl text-text-muted">Log a send to see your Session</h4>
        </div>
      ) : (
        sessions.map((session) => (
          <div key={session.id} className="mb-8 bg-bg-card rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{formatDate(session.createdAt)}</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-bg-primary p-4 rounded-lg">
                <div className="text-text-muted text-sm mb-1">Burns</div>
                <div className="text-2xl font-bold text-white">
                  {session.attempts.reduce((sum, attempt) => sum + attempt.tries, 0)}
                </div>
              </div>
              <div className="bg-bg-primary p-4 rounded-lg">
                <div className="text-text-muted text-sm mb-1">Sends</div>
                <div className="text-2xl font-bold text-white">
                  {session.attempts.filter(attempt => attempt.status === 'Sent').length}
                </div>
              </div>
              <div className="bg-bg-primary p-4 rounded-lg">
                <div className="text-text-muted text-sm mb-1">Points</div>
                <div className="text-2xl font-bold text-white">
                  {session.attempts.reduce((sum, attempt) => sum + attempt.points, 0)}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-bg-primary">
                    <th className="py-1 px-2 text-purple-400 w-1/4">Route</th>
                    <th className="py-1 px-2 text-purple-400 w-12">Burns</th>
                    <th className="py-1 px-2 text-purple-400 w-16">Status</th>
                    <th className="py-1 px-2 text-purple-400 w-12">Stars</th>
                    <th className="py-1 px-2 text-purple-400 w-16">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {session.attempts.map((attempt, index) => (
                    <tr key={index} className="border-b border-bg-primary">
                      <td className="py-1 px-2">{attempt.route}</td>
                      <td className="py-1 px-2">{attempt.tries}</td>
                      <td className="py-1 px-2">
                        <span className={`inline-block px-1 py-0.5 rounded ${
                          attempt.status === 'Sent' ? 'bg-success/20' : 'bg-warning/20'
                        }`}>
                          {attempt.status}
                        </span>
                      </td>
                      <td className="py-1 px-2">{formatStars(attempt.stars)}</td>
                      <td className="py-1 px-2 font-medium">{attempt.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Sessions;