import React, { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import Error from '../components/Error';
import { ApiError, QueryError } from '../types';

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

const Sessions: FC = () => {
  const { data, isLoading, error, refetch } = useQuery<Session[], QueryError>({
    queryKey: ['sessions'],
    queryFn: async () => {
      try {
        const response = await client.get('/sessions');
        console.log('Sessions response:', response.data);
        if (!response.data) {
          throw { 
            message: "Oops! We received unexpected data. Let's get you back on track.",
            status: 500 
          };
        }
        return Array.isArray(response.data) ? response.data : [];
      } catch (err: any) {
        console.error('Error fetching sessions:', err);
        const errorMessage = err.response?.data?.message || 
          err.message || 
          "Oops! We're having trouble loading your climbing sessions. Let's get you back on track.";

        throw {
          message: errorMessage,
          status: err.response?.status || 500,
          data: err.response?.data
        };
      }
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
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
      weekday: 'long',
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Sessions</h1>

      {sessions.length === 0 ? (
        <div className="text-left my-8">
          <h4 className="text-xl text-text-muted mb-4">Log a send to see your Session</h4>
        </div>
      ) : (
        sessions.map((session) => (
          <div key={session.id} className="mb-8 bg-bg-card rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{formatDate(session.createdAt)}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-bg-primary p-4 rounded-lg">
                <div className="text-text-muted text-sm mb-1">Tries</div>
                <div className="text-2xl font-bold text-white">{session.totalTries}</div>
              </div>
              <div className="bg-bg-primary p-4 rounded-lg">
                <div className="text-text-muted text-sm mb-1">Sends</div>
                <div className="text-2xl font-bold text-white">{session.totalSends}</div>
              </div>
              <div className="bg-bg-primary p-4 rounded-lg">
                <div className="text-text-muted text-sm mb-1">Points</div>
                <div className="text-2xl font-bold text-white">{session.totalPoints}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-bg-primary">
                    <th className="py-2 px-4">Route</th>
                    <th className="py-2 px-4">Tries</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Stars</th>
                    <th className="py-2 px-4">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {session.attempts.map((attempt, index) => (
                    <tr key={index} className="border-b border-bg-primary">
                      <td className="py-2 px-4">{attempt.route}</td>
                      <td className="py-2 px-4">{attempt.tries}</td>
                      <td className="py-2 px-4">
                        <span className={`inline-block px-2 py-1 rounded ${
                          attempt.status === 'Sent' ? 'bg-success/20' : 'bg-warning/20'
                        }`}>
                          {attempt.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">{'★'.repeat(attempt.stars)}</td>
                      <td className="py-2 px-4">{attempt.points}</td>
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