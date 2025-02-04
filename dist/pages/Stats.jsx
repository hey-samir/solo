"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
const client_1 = __importDefault(require("../api/client"));
const LoadingSpinner_1 = __importDefault(require("../components/LoadingSpinner"));
const Error_1 = __importDefault(require("../components/Error"));
const react_router_dom_1 = require("react-router-dom");
// Register Chart.js components
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.BarElement, chart_js_1.LineElement, chart_js_1.ArcElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Legend, chart_js_1.PointElement, chart_js_1.Filler);
const Stats = () => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('metrics');
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleError = (error) => {
        console.error('Stats error:', error);
        if (error?.status === 401) {
            navigate('/login');
            return 'Please log in to view your statistics';
        }
        return error?.message || 'Failed to load statistics';
    };
    const { data: stats, isLoading: statsLoading, error: statsError } = (0, react_query_1.useQuery)({
        queryKey: ['user-stats'],
        queryFn: async () => {
            const response = await client_1.default.get('/api/user/me/stats');
            return response.data;
        },
        retry: 1
    });
    const { data: chartData, isLoading: chartsLoading, error: chartsError } = (0, react_query_1.useQuery)({
        queryKey: ['user-stats-charts'],
        queryFn: async () => {
            const response = await client_1.default.get('/api/user/me/stats/charts');
            return response.data;
        },
        retry: 1,
        enabled: activeTab === 'trends'
    });
    if (statsLoading || (activeTab === 'trends' && chartsLoading)) {
        return <LoadingSpinner_1.default />;
    }
    if (statsError) {
        return (<Error_1.default message={handleError(statsError)} type="page" retry={() => window.location.reload()}/>);
    }
    if (!stats) {
        return <Error_1.default message="No statistics data available" type="page"/>;
    }
    if (activeTab === 'trends' && chartsError) {
        return (<Error_1.default message={handleError(chartsError)} type="page" retry={() => window.location.reload()}/>);
    }
    // Add strict null checks for chart data
    const canShowTrends = activeTab === 'trends' &&
        chartData &&
        chartData.ascentsByDifficulty?.labels &&
        chartData.sendsByDate?.labels &&
        chartData.metricsOverTime?.labels &&
        chartData.climbsPerSession?.labels &&
        chartData.sendRateByColor?.labels;
    return (<div className="container mx-auto px-4 py-8 font-lexend">
      <ul className="nav nav-pills mb-8 flex space-x-4 border-b border-border-default">
        <li className="nav-item" role="presentation">
          <button className={`nav-link text-text-primary px-4 py-2 ${activeTab === 'metrics' ? 'text-solo-purple border-b-2 border-solo-purple' : ''}`} onClick={() => setActiveTab('metrics')} type="button" role="tab">
            Metrics
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button className={`nav-link text-text-primary px-4 py-2 ${activeTab === 'trends' ? 'text-solo-purple border-b-2 border-solo-purple' : ''}`} onClick={() => setActiveTab('trends')} type="button" role="tab">
            Trends
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'metrics' && stats && (<div className="grid grid-cols-2 gap-4">
            <MetricCard value={stats.totalAscents ?? 'N/A'} label="Total Ascents"/>
            <MetricCard value={stats.totalSends ?? 'N/A'} label="Total Sends"/>
            <MetricCard value={stats.avgGrade ?? 'N/A'} label="Avg Grade"/>
            <MetricCard value={stats.avgSentGrade ?? 'N/A'} label="Avg. Sent Grade"/>
            <MetricCard value={stats.totalPoints ?? 'N/A'} label="Total Points"/>
            <MetricCard value={stats.avgPointsPerClimb ?? 'N/A'} label="Avg Pts / Ascent"/>
            <MetricCard value={stats.successRate ? `${stats.successRate}%` : 'N/A'} label="Send Rate"/>
            <MetricCard value={stats.successRatePerSession ? `${stats.successRatePerSession}%` : 'N/A'} label="Session Send Rate"/>
            <MetricCard value={stats.climbsPerSession ?? 'N/A'} label="Ascents / Session"/>
            <MetricCard value={stats.avgAttemptsPerClimb ?? 'N/A'} label="Tries / Ascent"/>
          </div>)}

        {activeTab === 'trends' && (<div className="space-y-8">
            <ChartCard title="Route Mix" chart={<div className="h-[300px]">
                  <react_chartjs_2_1.Doughnut data={{
                    labels: ['5.8', '5.9', '5.10a', '5.10b', '5.10c'],
                    datasets: [{
                            data: [10, 15, 8, 12, 5],
                            backgroundColor: ['#4C1D95', '#3B0764', '#350567', '#2F035E', '#290356']
                        }]
                }} options={{
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
                }}/>
                </div>}/>

            <ChartCard title="Sends Over Time" chart={<div className="h-[300px]">
                  <react_chartjs_2_1.Bar data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        {
                            label: 'Sends',
                            data: [5, 7, 4, 8, 6, 9, 7],
                            backgroundColor: '#7442d6'
                        },
                        {
                            label: 'Attempts',
                            data: [2, 3, 1, 4, 2, 3, 2],
                            backgroundColor: '#6c757d'
                        }
                    ]
                }} options={{
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
                }}/>
                </div>}/>

            <ChartCard title="Send Rate" chart={<div className="h-[300px]">
                  <react_chartjs_2_1.Line data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                            label: 'Success Rate',
                            data: [75, 80, 85, 82, 88, 85, 90],
                            borderColor: '#7442d6',
                            backgroundColor: 'rgba(116, 66, 214, 0.2)',
                            fill: true,
                            tension: 0.4
                        }]
                }} options={{
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
                }}/>
                </div>}/>
          </div>)}
      </div>
    </div>);
};
const MetricCard = ({ value, label }) => (<div className="bg-bg-card rounded-card shadow-card p-6 text-center">
    <div className="text-text-primary text-2xl font-bold mb-2">{value}</div>
    <div className="text-text-muted text-sm">{label}</div>
  </div>);
const ChartCard = ({ title, chart }) => (<div className="bg-bg-card rounded-card shadow-card overflow-hidden">
    <div className="p-4 border-b border-border-default">
      <h3 className="text-text-primary text-lg font-semibold">{title}</h3>
    </div>
    <div className="p-4">
      {chart}
    </div>
  </div>);
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
};
const getGradeColor = (grade) => {
    const gradeColors = {
        '5.8': '#4C1D95', '5.9': '#3B0764',
        '5.10a': '#350567', '5.10b': '#2F035E',
        '5.10c': '#290356', '5.10d': '#23034E',
        '5.11a': '#1D0345', '5.11b': '#18033C',
        '5.11c': '#130333', '5.11d': '#0E032B'
    };
    return gradeColors[grade] || '#7442d6';
};
exports.default = Stats;
