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
import { Bar, Line } from 'react-chartjs-2'
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
  date: string;
  attempts: number;
  sends: number;
  points: number;
  uniqueRoutes: number;
  avgGrade: string | null;
}

const Stats: FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'trends'>('metrics')
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<StatsType, AxiosError>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await client.get('/api/user/me/stats')
      return response.data
    },
    retry: 1
  })

  const { data: chartData, isLoading: chartsLoading, error: chartsError } = useQuery<ChartDataPoint[], AxiosError>({
    queryKey: ['user-stats-charts'],
    queryFn: async () => {
      const response = await client.get('/api/user/me/stats/charts')
      return response.data
    },
    retry: 1,
    enabled: activeTab === 'trends'
  })

  if (statsLoading || (activeTab === 'trends' && chartsLoading)) {
    return <LoadingSpinner />
  }

  if (statsError || (activeTab === 'trends' && chartsError)) {
    const error = statsError || chartsError
    if (error?.response?.status === 401) {
      navigate('/login')
      return null
    }
    const errorMessage = error?.response?.data?.error || 'Failed to load statistics'
    return <ServerError code={error?.response?.status || 500} message={errorMessage} />
  }

  if (!stats || (activeTab === 'trends' && !chartData)) {
    return <ServerError code={500} message="No statistics data available" />
  }

  return (
    <div className="container px-6 py-8 font-lexend">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Stats</h1>

      <div className="relative mb-8">
        <div className="flex border-b border-border-default">
          <button
            className={`px-6 py-3 text-text-primary relative ${activeTab === 'metrics' ? 'text-solo-purple' : ''}`}
            onClick={() => setActiveTab('metrics')}
            type="button"
            role="tab"
          >
            Metrics
            {activeTab === 'metrics' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-solo-purple transition-all duration-300" />
            )}
          </button>
          <button
            className={`px-6 py-3 text-text-primary relative ${activeTab === 'trends' ? 'text-solo-purple' : ''}`}
            onClick={() => setActiveTab('trends')}
            type="button"
            role="tab"
          >
            Trends
            {activeTab === 'trends' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-solo-purple transition-all duration-300" />
            )}
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'metrics' && (
          <div className="grid grid-cols-2 gap-4">
            <MetricCard value={stats.totalAscents} label="Burns" />
            <MetricCard value={stats.totalSends} label="Sends" />
            <MetricCard value={stats.avgGrade} label="Avg Grade" />
            <MetricCard value={stats.avgSentGrade} label="Avg. Sent Grade" />
            <MetricCard value={stats.totalPoints} label="Total Points" />
            <MetricCard value={stats.avgPointsPerClimb} label="Pts / Burn" />
            <MetricCard value={`${stats.successRate}%`} label="Send Rate" />
            <MetricCard value={`${stats.successRatePerSession}%`} label="Session Send Rate" />
            <MetricCard value={stats.climbsPerSession} label="Burns / Session" />
            <MetricCard value={stats.avgAttemptsPerClimb} label="Burns / Route" />
          </div>
        )}

        {activeTab === 'trends' && chartData && (
          <div className="space-y-8">
            <ChartCard
              title="Progress"
              chart={
                <div className="h-[300px]">
                  <Line
                    data={{
                      labels: chartData.map(data => formatDate(data.date)),
                      datasets: [
                        {
                          label: 'Points / Session',
                          data: chartData.map(data => data.points),
                          borderColor: '#7442d6',
                          backgroundColor: 'rgba(116, 66, 214, 0.2)',
                          fill: true,
                          tension: 0.4
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
                          },
                          ticks: {
                            color: '#CBD5E1'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: '#CBD5E1'
                          }
                        }
                      },
                      plugins: {
                        legend: {
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
              title="Sends Mix"
              chart={
                <div className="h-[300px]">
                  <Bar
                    data={{
                      labels: chartData.map(data => formatDate(data.date)),
                      datasets: [
                        {
                          label: 'Sends',
                          data: chartData.map(data => data.sends),
                          backgroundColor: '#7442d6',
                          flex: 1
                        },
                        {
                          label: 'Tries',
                          data: chartData.map(data => data.attempts),
                          backgroundColor: '#6c757d',
                          flex: 1
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
                          },
                          ticks: {
                            color: '#CBD5E1'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: '#CBD5E1'
                          }
                        }
                      },
                      plugins: {
                        legend: {
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
              title="Grade Progression"
              chart={
                <div className="h-[300px]">
                  <Line
                    data={{
                      labels: chartData.map(data => formatDate(data.date)),
                      datasets: [
                        {
                          label: 'Average Grade',
                          data: chartData.map(data => {
                            if (data.avgGrade) {
                              const gradeNum = parseFloat(data.avgGrade.replace('5.', ''));
                              return gradeNum || null;
                            }
                            return null;
                          }),
                          borderColor: '#7442d6',
                          backgroundColor: 'rgba(116, 66, 214, 0.2)',
                          fill: true,
                          tension: 0.4
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: false,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                            color: '#CBD5E1',
                            callback: function(value) {
                              return '5.' + value;
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: '#CBD5E1'
                          }
                        }
                      },
                      plugins: {
                        legend: {
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

export default Stats