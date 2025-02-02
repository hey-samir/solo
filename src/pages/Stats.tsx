import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import Error from '../components/Error'
import { useNavigate } from 'react-router-dom'

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

interface Stats {
  totalAscents: number;
  totalSends: number;
  totalPoints: number;
  avgGrade: string;
  avgSentGrade: string;
  avgPointsPerClimb: number;
  successRate: number;
  successRatePerSession: number;
  climbsPerSession: number;
  avgAttemptsPerClimb: number;
}

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

  const handleError = (error: any) => {
    console.error('Stats error:', error);
    if (error?.status === 401) {
      navigate('/login');
      return 'Please log in to view your statistics';
    }
    return error?.message || 'Failed to load statistics';
  };

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<Stats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await client.get('/api/user/me/stats')
      return response.data
    },
    retry: 1
  })

  const { data: chartData, isLoading: chartsLoading, error: chartsError } = useQuery<ChartData>({
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

  if (statsError) {
    return (
      <Error 
        message={handleError(statsError)} 
        type="page"
        retry={() => window.location.reload()}
      />
    )
  }

  if (!stats) {
    return <Error message="No statistics data available" type="page" />
  }

  if (activeTab === 'trends' && chartsError) {
    return (
      <Error 
        message={handleError(chartsError)} 
        type="page"
        retry={() => window.location.reload()}
      />
    )
  }

  // Add strict null checks for chart data
  const canShowTrends = activeTab === 'trends' && 
    chartData && 
    chartData.ascentsByDifficulty?.labels &&
    chartData.sendsByDate?.labels &&
    chartData.metricsOverTime?.labels &&
    chartData.climbsPerSession?.labels &&
    chartData.sendRateByColor?.labels;

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
                value={stats.totalAscents ?? 'N/A'}
                label="Total Ascents"
              />
              <MetricCard
                value={stats.totalSends ?? 'N/A'}
                label="Total Sends"
              />
              <MetricCard
                value={stats.avgGrade ?? 'N/A'}
                label="Avg Grade"
              />
              <MetricCard
                value={stats.avgSentGrade ?? 'N/A'}
                label="Avg. Sent Grade"
              />
              <MetricCard
                value={stats.totalPoints ?? 'N/A'}
                label="Total Points"
              />
              <MetricCard
                value={stats.avgPointsPerClimb ?? 'N/A'}
                label="Avg Pts / Ascent"
              />
              <MetricCard
                value={stats.successRate ? `${stats.successRate}%` : 'N/A'}
                label="Send Rate"
              />
              <MetricCard
                value={stats.successRatePerSession ? `${stats.successRatePerSession}%` : 'N/A'}
                label="Session Send Rate"
              />
              <MetricCard
                value={stats.climbsPerSession ?? 'N/A'}
                label="Ascents / Session"
              />
              <MetricCard
                value={stats.avgAttemptsPerClimb ?? 'N/A'}
                label="Tries / Ascent"
              />
            </div>
          )}

        {canShowTrends && chartData && (
          <div className="space-y-8">
            {chartData.ascentsByDifficulty && (
              <ChartCard
                title="Route Mix"
                chart={
                  <div className="h-[300px]">
                    <Doughnut
                      data={{
                        labels: chartData.ascentsByDifficulty.labels,
                        datasets: [{
                          data: chartData.ascentsByDifficulty.data,
                          backgroundColor: chartData.ascentsByDifficulty.labels.map(getGradeColor)
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
            )}

            {chartData.sendsByDate && (
              <ChartCard
                title="Sends"
                chart={
                  <div className="h-[300px]">
                    <Bar
                      data={{
                        labels: chartData.sendsByDate.labels.map(formatDate),
                        datasets: [
                          {
                            label: 'Sends',
                            data: chartData.sendsByDate.sends,
                            backgroundColor: '#7442d6',
                            stack: 'combined'
                          },
                          {
                            label: 'Attempts',
                            data: chartData.sendsByDate.attempts,
                            backgroundColor: '#6c757d',
                            stack: 'combined'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            stacked: true
                          },
                          x: {
                            stacked: true
                          }
                        }
                      }}
                    />
                  </div>
                }
              />
            )}

            {chartData.metricsOverTime && (
              <ChartCard
                title="Send Rate"
                chart={
                  <div className="h-[300px]">
                    <Line
                      data={{
                        labels: chartData.metricsOverTime.labels.map(formatDate),
                        datasets: [{
                          label: 'Send Rate',
                          data: chartData.metricsOverTime.metrics[0].data,
                          borderColor: '#7442d6',
                          backgroundColor: 'rgba(116, 66, 214, 0.2)',
                          fill: true,
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100
                          }
                        }
                      }}
                    />
                  </div>
                }
              />
            )}

            {chartData.climbsPerSession && (
              <ChartCard
                title="Routes per Session"
                chart={
                  <div className="h-[300px]">
                    <Line
                      data={{
                        labels: chartData.climbsPerSession.labels.map(formatDate),
                        datasets: [{
                          label: 'Routes',
                          data: chartData.climbsPerSession.data,
                          borderColor: '#7442d6',
                          backgroundColor: 'rgba(116, 66, 214, 0.2)',
                          fill: true,
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                }
              />
            )}

            {chartData.sendRateByColor && (
              <ChartCard
                title="Send Rate by Color"
                chart={
                  <div className="h-[300px]">
                    <Bar
                      data={{
                        labels: chartData.sendRateByColor.labels,
                        datasets: [{
                          data: chartData.sendRateByColor.data,
                          backgroundColor: '#7442d6'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              callback: (value) => `${value}%`
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }}
                    />
                  </div>
                }
              />
            )}
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
  <div className="bg-bg-card rounded-card shadow-card p-6">
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