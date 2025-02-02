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

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<Stats>({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await client.get('/api/user/me/stats')
      return response.data
    }
  })

  const { data: chartData, isLoading: chartsLoading, error: chartsError } = useQuery<ChartData>({
    queryKey: ['user-stats-charts'],
    queryFn: async () => {
      const response = await client.get('/api/user/me/stats/charts')
      return response.data
    }
  })

  if (statsLoading || chartsLoading) {
    return <LoadingSpinner />
  }

  if (statsError || chartsError) {
    return <Error message="Failed to load statistics" type="page" />
  }

  if (!stats || !chartData) {
    return <Error message="No statistics data available" type="page" />
  }

  return (
    <div className="container stats-container">
      <ul className="nav nav-pills stats-pills mb-4 sticky-top" role="tablist" 
          style={{ top: 0, zIndex: 1020, backgroundColor: '#212529' }}>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link bg-solo-purple hover:bg-solo-purple-light text-white ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
            type="button"
            role="tab"
          >
            Metrics
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link bg-solo-purple hover:bg-solo-purple-light text-white ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
            type="button"
            role="tab"
          >
            Trends
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'metrics' && (
          <div className="row row-cols-1 row-cols-md-2 g-2 mb-4">
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
              label="Tries / Ascent"
            />
          </div>
        )}

        {activeTab === 'trends' && (
          <div>
            <ChartCard
              title="Route Mix"
              chart={
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
              }
            />

            <ChartCard
              title="Sends"
              chart={
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
              }
            />

            <ChartCard
              title="Send Rate"
              chart={
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
              }
            />

            <ChartCard
              title="Routes per Session"
              chart={
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
              }
            />

            <ChartCard
              title="Send Rate by Color"
              chart={
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
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Components
interface MetricCardProps {
  value: number | string | undefined;
  label: string;
}

const MetricCard: FC<MetricCardProps> = ({ value, label }) => (
  <div className="col-6 mb-2">
    <div className="metric-card" style={{ height: '100px' }}>
      <div className="metric-value">{value ?? 0}</div>
      <div className="metric-label">{label}</div>
    </div>
  </div>
)

interface ChartCardProps {
  title: string;
  chart: React.ReactNode;
}

const ChartCard: FC<ChartCardProps> = ({ title, chart }) => (
  <div className="card mb-4">
    <div className="card-header bg-transparent">
      <h5 className="card-title mb-0">{title}</h5>
    </div>
    <div className="card-body">
      <div style={{ height: '300px', width: '100%' }}>
        {chart}
      </div>
    </div>
  </div>
)

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