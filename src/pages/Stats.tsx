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
  totalAscents: number
  totalSends: number
  totalPoints: number
  avgGrade: string
  avgSentGrade: string
  avgPointsPerClimb: number
  successRate: number
  successRatePerSession: number
  climbsPerSession: number
  avgAttemptsPerClimb: number
}

interface ChartData {
  labels: string[]
  data: number[]
}

interface TimeSeriesData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
  }[]
}

const Stats: FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'trends'>('metrics')

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await client.get('/user/me/stats')
      return response.data
    }
  })

  const { data: chartData, isLoading: chartsLoading } = useQuery({
    queryKey: ['stats-charts'],
    queryFn: async () => {
      const response = await client.get('/api/stats')
      return response.data
    }
  })

  if (statsLoading || chartsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container stats-container">
      {/* Main Content Pills */}
      <ul className="nav nav-pills stats-pills mb-4 sticky-top" role="tablist" style={{ top: 0, zIndex: 1020, backgroundColor: '#212529' }}>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
            type="button"
            role="tab"
          >
            Metrics
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
            type="button"
            role="tab"
          >
            Trends
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="row row-cols-1 row-cols-md-2 g-2 mb-4">
            <div className="col-6 mb-2">
              <div className="metric-card" style={{ height: '100px' }}>
                <div className="metric-value">{stats?.totalAscents}</div>
                <div className="metric-label">Total Ascents</div>
              </div>
            </div>
            <div className="col-6 mb-2">
              <div className="metric-card" style={{ height: '100px' }}>
                <div className="metric-value">{stats?.totalSends}</div>
                <div className="metric-label">Total Sends</div>
              </div>
            </div>
            <div className="col-6 mb-2">
              <div className="metric-card" style={{ height: '100px' }}>
                <div className="metric-value">{stats?.avgGrade}</div>
                <div className="metric-label">Avg Grade</div>
              </div>
            </div>
            <div className="col-6 mb-2">
              <div className="metric-card" style={{ height: '100px' }}>
                <div className="metric-value">{stats?.avgSentGrade}</div>
                <div className="metric-label">Avg. Sent Grade</div>
              </div>
            </div>
            <div className="col-6 mb-2">
              <div className="metric-card" style={{ height: '100px' }}>
                <div className="metric-value">{stats?.totalPoints}</div>
                <div className="metric-label">Total Points</div>
              </div>
            </div>
            <div className="col-6 mb-2">
              <div className="metric-card" style={{ height: '100px' }}>
                <div className="metric-value">{stats?.avgPointsPerClimb}</div>
                <div className="metric-label">Avg Pts / Ascent</div>
              </div>
            </div>
            <div className="col-6 mb-2">
              <div className="metric-card" style={{ height: '100px' }}>
                <div className="metric-value">{stats?.successRate}%</div>
                <div className="metric-label">Send Rate</div>
              </div>
            </div>
            <div className="col-6 mb-2">
              <div className="metric-card" style={{ height: '100px' }}>
                <div className="metric-value">{stats?.successRatePerSession}%</div>
                <div className="metric-label">Session Send Rate</div>
              </div>
            </div>
            <div className="col-6 mb-2">
              <div className="metric-card" style={{ height: '100px' }}>
                <div className="metric-value">{stats?.climbsPerSession}</div>
                <div className="metric-label">Ascents / Session</div>
              </div>
            </div>
            <div className="col-6 mb-2">
              <div className="metric-card" style={{ height: '100px' }}>
                <div className="metric-value">{stats?.avgAttemptsPerClimb}</div>
                <div className="metric-label">Tries / Ascent</div>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && chartData && (
          <div>
            {/* Route Mix */}
            <div className="card mb-4">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">Route Mix</h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px', width: '100%' }}>
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
                          position: 'right'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sends by Date */}
            <div className="card mb-4">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">Sends</h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px', width: '100%' }}>
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
              </div>
            </div>

            {/* Send Rate Over Time */}
            <div className="card mb-4">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">Send Rate</h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px', width: '100%' }}>
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
              </div>
            </div>

            {/* Routes per Session */}
            <div className="card mb-4">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">Routes per Session</h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px', width: '100%' }}>
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
              </div>
            </div>

            {/* Send Rate by Color */}
            <div className="card mb-4">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">Send Rate by Color</h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px', width: '100%' }}>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
}

const getGradeColor = (grade: string) => {
  const gradeColors: Record<string, string> = {
    '5.0': '#E9D8FD', '5.1': '#D6BCFA', '5.2': '#C084FC', '5.3': '#A855F7',
    '5.4': '#9333EA', '5.5': '#7E22CE', '5.6': '#6B21A8', '5.7': '#581C87',
    '5.8': '#4C1D95', '5.9': '#3B0764', '5.10a': '#350567', '5.10b': '#2F035E',
    '5.10c': '#290356', '5.10d': '#23034E', '5.11a': '#1D0345', '5.11b': '#18033C',
    '5.11c': '#130333', '5.11d': '#0E032B', '5.12a': '#090222', '5.12b': '#08021D',
    '5.12c': '#07021A', '5.12d': '#060216', '5.13a': '#050213', '5.13b': '#040210',
    '5.13c': '#03020D', '5.13d': '#02020A', '5.14a': '#010207', '5.14b': '#010106',
    '5.14c': '#010105', '5.14d': '#010104', '5.15a': '#010103', '5.15b': '#010102',
    '5.15c': '#010101', '5.15d': '#000000'
  }
  return gradeColors[grade] || '#7442d6'
}

export default Stats