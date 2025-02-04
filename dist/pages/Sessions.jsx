"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_query_1 = require("@tanstack/react-query");
const client_1 = __importDefault(require("../api/client"));
const LoadingSpinner_1 = __importDefault(require("../components/LoadingSpinner"));
const Error_1 = __importDefault(require("../components/Error"));
const Sessions = () => {
    const { data, isLoading, error, refetch } = (0, react_query_1.useQuery)({
        queryKey: ['sessions'],
        queryFn: async () => {
            try {
                console.log('Fetching sessions...');
                const response = await client_1.default.get('/sessions');
                if (!response.data) {
                    throw {
                        message: "Oops! We received unexpected data. Let's get you back on track.",
                        status: 500
                    };
                }
                return Array.isArray(response.data) ? response.data : [];
            }
            catch (err) {
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
        return <LoadingSpinner_1.default />;
    }
    if (error) {
        return (<Error_1.default message={error.message} type="page" retry={() => refetch()}/>);
    }
    const sessions = data || [];
    const formatDuration = (hours) => {
        if (hours < 1) {
            return `${Math.round(hours * 60)} min`;
        }
        return `${Math.round(hours)} hr`;
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    return (<div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Climbing Sessions</h1>

      {sessions.map((session) => (<div key={session.id} className="mb-8 bg-bg-card rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{formatDate(session.createdAt)}</h2>
            <span className="text-text-muted">
              Duration: {formatDuration(session.duration)}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-bg-primary p-4 rounded-lg">
              <div className="text-text-muted text-sm mb-1">Total Climbs</div>
              <div className="text-2xl font-bold">{session.totalClimbs}</div>
            </div>
            <div className="bg-bg-primary p-4 rounded-lg">
              <div className="text-text-muted text-sm mb-1">Sends</div>
              <div className="text-2xl font-bold text-success">{session.totalSends}</div>
            </div>
            <div className="bg-bg-primary p-4 rounded-lg">
              <div className="text-text-muted text-sm mb-1">Success Rate</div>
              <div className="text-2xl font-bold">{session.successRate}%</div>
            </div>
            <div className="bg-bg-primary p-4 rounded-lg">
              <div className="text-text-muted text-sm mb-1">Points</div>
              <div className="text-2xl font-bold text-solo-purple">{session.totalPoints}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {session.grades.map((grade) => (<span key={grade} className="bg-bg-primary px-3 py-1 rounded-full text-sm">
                {grade}
              </span>))}
          </div>
        </div>))}

      {sessions.length === 0 && (<div className="text-center my-8">
          <h4 className="text-xl text-text-muted mb-4">Enter your first climb to see Sessions</h4>
          <a href="/sends" className="inline-block bg-solo-purple text-white px-6 py-2 rounded-lg hover:bg-solo-purple-light transition">
            Back to Sends
          </a>
        </div>)}
    </div>);
};
exports.default = Sessions;
