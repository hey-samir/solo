import React, { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';
import Error from '../components/Error';
import { ApiError, QueryError } from '../types';

interface Route {
  color: string;
  grade: string;
}

interface Climb {
  id: number;
  routeId: number;
  status: boolean;
  rating: number;
  tries: number;
  notes: string | null;
  points: number;
  createdAt: string;
  route: Route;
}

type SortKey = 'color' | 'grade' | 'status' | 'tries' | 'rating' | 'points';
type SortDirection = 'asc' | 'desc';

const Sessions: FC = () => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
    date: string | null;
  }>({
    key: 'color',
    direction: 'asc',
    date: null,
  });

  const { data, isLoading, error, refetch } = useQuery<Climb[], QueryError>({
    queryKey: ['climbs'],
    queryFn: async () => {
      try {
        const response = await client.get('/api/climbs');
        if (!response.data || !Array.isArray(response.data)) {
          throw { 
            message: "Oops! We received unexpected data. Let's get you back on track.",
            status: 500 
          };
        }
        return response.data;
      } catch (err: any) {
        console.error('Error fetching climbs:', err);
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

  const climbs = data || [];
  const climbsByDate = climbs.reduce<{[date: string]: Climb[]}>((acc, climb) => {
    if (climb?.createdAt) {
      const date = new Date(climb.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(climb);
    }
    return acc;
  }, {});

  const getColorHex = (color: string): string => {
    const colorMap: Record<string, string> = {
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
    return colorMap[color] || '#CCCCCC'
  }

  const sortClimbs = (climbsToSort: Climb[]) => {
    return [...climbsToSort].sort((a, b) => {
      let comparison = 0
      switch (sortConfig.key) {
        case 'color':
          comparison = a.route.color.localeCompare(b.route.color)
          break
        case 'grade':
          comparison = a.route.grade.localeCompare(b.route.grade)
          break
        case 'status':
          comparison = Number(b.status) - Number(a.status)
          break
        case 'tries':
          comparison = a.tries - b.tries
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'points':
          comparison = a.points - b.points
          break
        default:
          return 0
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Climbing Sessions</h1>

      {Object.entries(climbsByDate).map(([date, sessionClimbs]) => (
        <div key={date} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{date}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-card border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th 
                    className="px-4 py-2 cursor-pointer" 
                    onClick={() => setSortConfig(current => ({
                      key: 'color',
                      direction: 
                        current.key === 'color' && current.date === date && current.direction === 'asc' 
                          ? 'desc' 
                          : 'asc',
                      date
                    }))}
                  >
                    Color {sortConfig.key === 'color' && sortConfig.date === date && 
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => setSortConfig(current => ({
                      key: 'grade',
                      direction: 
                        current.key === 'grade' && current.date === date && current.direction === 'asc' 
                          ? 'desc' 
                          : 'asc',
                      date
                    }))}
                  >
                    Grade {sortConfig.key === 'grade' && sortConfig.date === date &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => setSortConfig(current => ({
                      key: 'status',
                      direction: 
                        current.key === 'status' && current.date === date && current.direction === 'asc' 
                          ? 'desc' 
                          : 'asc',
                      date
                    }))}
                  >
                    Status {sortConfig.key === 'status' && sortConfig.date === date &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => setSortConfig(current => ({
                      key: 'tries',
                      direction: 
                        current.key === 'tries' && current.date === date && current.direction === 'asc' 
                          ? 'desc' 
                          : 'asc',
                      date
                    }))}
                  >
                    # Tries {sortConfig.key === 'tries' && sortConfig.date === date &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => setSortConfig(current => ({
                      key: 'rating',
                      direction: 
                        current.key === 'rating' && current.date === date && current.direction === 'asc' 
                          ? 'desc' 
                          : 'asc',
                      date
                    }))}
                  >
                    Stars {sortConfig.key === 'rating' && sortConfig.date === date &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => setSortConfig(current => ({
                      key: 'points',
                      direction: 
                        current.key === 'points' && current.date === date && current.direction === 'asc' 
                          ? 'desc' 
                          : 'asc',
                      date
                    }))}
                  >
                    Points {sortConfig.key === 'points' && sortConfig.date === date &&
                      (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortClimbs(sessionClimbs).map((climb) => (
                  <tr key={climb.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="flex items-center">
                        <span 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ 
                            backgroundColor: getColorHex(climb.route.color),
                            border: climb.route.color === 'White' ? '1px solid #ccc' : 'none'
                          }}
                        />
                        {climb.route.color}
                      </div>
                    </td>
                    <td className="px-4 py-2">{climb.route.grade}</td>
                    <td className="px-4 py-2">
                      <span className={`font-medium ${climb.status ? 'text-green-600' : 'text-red-600'}`}>
                        {climb.status ? 'Send' : 'Attempt'}
                      </span>
                    </td>
                    <td className="px-4 py-2">{climb.tries}</td>
                    <td className="px-4 py-2">{climb.rating}/5</td>
                    <td className="px-4 py-2">
                      <span className="text-solo-purple font-medium">
                        {climb.points} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {Object.keys(climbsByDate).length === 0 && (
        <div className="text-center my-8">
          <h4 className="text-xl text-gray-600 mb-4">Enter your first climb to see Sessions</h4>
          <a 
            href="/sends" 
            className="inline-block bg-solo-purple text-white px-6 py-2 rounded-lg hover:bg-solo-purple-light transition"
          >
            Back to Sends
          </a>
        </div>
      )}
    </div>
  );
};

export default Sessions;