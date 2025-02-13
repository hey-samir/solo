import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import client from '../api/client'
import LoadingSpinner from '../components/LoadingSpinner'
import { ServerError } from '../components/Error'
import { useNavigate } from 'react-router-dom'
import type { Stats as StatsType } from '../types'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler
)

interface ChartDataPoint {
  name: string;
  data: number[];
}

interface ChartData {
  ascentsByDifficulty: {
    labels: string[];
    data: number[];
  };
  sendsByDate: {
    labels: string[];
    sends: number[];
    attempts: number[];
  };
  metricsOverTime: {
    labels: string[];
    metrics: ChartDataPoint[];
  };
  climbsPerSession: {
    labels: string[];
    data: number[];
  };
  sendRateByColor: {
    labels: string[];
    data: number[];
  };
}

const Stats: FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'trends'>('metrics')
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<StatsType, AxiosError>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      try {
        console.log('[Stats] Fetching user stats...')
        const response = await client.get('/api/user/me/stats')
        console.log('[Stats] Raw response:', response)

        if (!response.data) {
          console.error('[Stats] No data received from API')
          throw new Error('No data received from API')
        }

        return response.data
      } catch (error) {
        console.error('[Stats] Error fetching stats:', error)
        if (error instanceof Error) {
          console.error('[Stats] Error details:', error.message)
          if ('response' in error) {
            console.error('[Stats] Response error:', (error as any).response?.data)
          }
        }
        throw error
      }
    },
    retry: 1
  })

  const { data: chartData, isLoading: chartsLoading, error: chartsError } = useQuery<ChartData, AxiosError>({
    queryKey: ['user-stats-charts'],
    queryFn: async () => {
      try {
        console.log('[Stats] Fetching chart data...')
        const response = await client.get('/api/user/me/stats/charts')
        console.log('[Stats] Charts raw response:', response)

        if (!response.data) {
          console.error('[Stats] No chart data received from API')
          throw new Error('No chart data received from API')
        }

        return response.data
      } catch (error) {
        console.error('[Stats] Error fetching chart data:', error)
        if (error instanceof Error) {
          console.error('[Stats] Chart error details:', error.message)
          if ('response' in error) {
            console.error('[Stats] Chart response error:', (error as any).response?.data)
          }
        }
        throw error
      }
    },
    retry: 1,
    enabled: activeTab === 'trends'
  })

  if (statsLoading || (activeTab === 'trends' && chartsLoading)) {
    return <LoadingSpinner />
  }

  if (statsError || (activeTab === 'trends' && chartsError)) {
    const error = statsError || chartsError
    console.error('[Stats] Rendering error state:', error)
    if (error?.response?.status === 401) {
      navigate('/login')
      return null
    }
    const errorMessage = error?.response?.data?.message || 'Failed to load statistics'
    return <ServerError code={error?.response?.status || 500} message={errorMessage} />
  }

  if (!stats || (activeTab === 'trends' && !chartData)) {
    return <ServerError code={500} message="No statistics data available" />
  }

  return (
    <div className="container mx-auto px-4 py-8 font-lexend">
      <ul className="nav nav-pills mb-8 flex space-x-4 border-b border-border-default">
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link text-text-primary px-4 py-2 ${activeTab === 'metrics' ? 'text-solo-purple border-b-2 border-solo-purple' : ''}`}
            onClick={() => setActiveTab('metrics')}
            type="button"
            role="tab"
          >
            Metrics
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link text-text-primary px-4 py-2 ${activeTab === 'trends' ? 'text-solo-purple border-b-2 border-solo-purple' : ''}`}
            onClick={() => setActiveTab('trends')}
            type="button"
            role="tab"
          >
            Trends
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'metrics' && stats && (
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              value={stats.totalAscents}
              label="Total Ascents"
            />
            <MetricCard
              value={stats.totalSends}
              label="Total Sends"
            />
            <MetricCard
              value={stats.avgGrade}
              label="Avg Grade"
            />
            <MetricCard
              value={stats.avgSentGrade}
              label="Avg. Sent Grade"
            />
            <MetricCard
              value={stats.totalPoints}
              label="Total Points"
            />
            <MetricCard
              value={stats.avgPointsPerClimb}
              label="Avg Pts / Ascent"
            />
            <MetricCard
              value={`${stats.successRate}%`}
              label="Send Rate"
            />
            <MetricCard
              value={`${stats.successRatePerSession}%`}
              label="Session Send Rate"
            />
            <MetricCard
              value={stats.climbsPerSession}
              label="Ascents / Session"
            />
            <MetricCard
              value={stats.avgAttemptsPerClimb}
              label="Attempts / Ascent"
            />
          </div>
        )}

        {activeTab === 'trends' && chartData && (
          <div className="space-y-8">
            <ChartCard
              title="Route Mix"
              chart={
                <div className="h-[300px]">
                  <Doughnut
                    data={{
                      labels: chartData.ascentsByDifficulty.labels,
                      datasets: [{
                        data: chartData.ascentsByDifficulty.data,
                        backgroundColor: chartData.ascentsByDifficulty.labels.map(grade => getGradeColor(grade))
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            color: '#CBD5E1'
                          }
                        }
                      }
                    }}
                  />
                </div>
              }
            />

            <ChartCard
              title="Sends Over Time"
              chart={
                <div className="h-[300px]">
                  <Bar
                    data={{
                      labels: chartData.sendsByDate.labels.map(formatDate),
                      datasets: [
                        {
                          label: 'Sends',
                          data: chartData.sendsByDate.sends,
                          backgroundColor: '#7442d6'
                        },
                        {
                          label: 'Tries',
                          data: chartData.sendsByDate.attempts,
                          backgroundColor: '#6c757d'
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              }
            />

            <ChartCard
              title="Send Rate"
              chart={
                <div className="h-[300px]">
                  <Line
                    data={{
                      labels: chartData.metricsOverTime.labels.map(formatDate),
                      datasets: chartData.metricsOverTime.metrics.map(metric => ({
                        label: metric.name,
                        data: metric.data,
                        borderColor: '#7442d6',
                        backgroundColor: 'rgba(116, 66, 214, 0.2)',
                        fill: true,
                        tension: 0.4
                      }))
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}

interface MetricCardProps {
  value: number | string;
  label: string;
}

const MetricCard: FC<MetricCardProps> = ({ value, label }) => (
  <div className="bg-bg-card rounded-card shadow-card p-6 text-center">
    <div className="text-text-primary text-2xl font-bold mb-2">{value}</div>
    <div className="text-text-muted text-sm">{label}</div>
  </div>
)

interface ChartCardProps {
  title: string;
  chart: React.ReactNode;
}

const ChartCard: FC<ChartCardProps> = ({ title, chart }) => (
  <div className="bg-bg-card rounded-card shadow-card overflow-hidden">
    <div className="p-4 border-b border-border-default">
      <h3 className="text-text-primary text-lg font-semibold">{title}</h3>
    </div>
    <div className="p-4">
      {chart}
    </div>
  </div>
)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
}

const getGradeColor = (grade: string) => {
  const gradeColors: Record<string, string> = {
    '5.8': '#4C1D95', '5.9': '#3B0764',
    '5.10a': '#350567', '5.10b': '#2F035E',
    '5.10c': '#290356', '5.10d': '#23034E',
    '5.11a': '#1D0345', '5.11b': '#18033C',
    '5.11c': '#130333', '5.11d': '#0E032B'
  }
  return gradeColors[grade] || '#7442d6'
}

export default Stats