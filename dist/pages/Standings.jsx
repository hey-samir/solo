"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_query_1 = require("@tanstack/react-query");
const client_1 = __importDefault(require("../api/client"));
const LoadingSpinner_1 = __importDefault(require("../components/LoadingSpinner"));
const Standings = () => {
    const [cacheInfo, setCacheInfo] = (0, react_1.useState)({
        isFromCache: false,
        timestamp: null
    });
    const { data: leaderboard, isLoading, error } = (0, react_query_1.useQuery)({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            try {
                const response = await client_1.default.get('/api/leaderboard');
                // Check response headers for cache information
                const timestamp = response.headers?.['x-cache-timestamp'] || null;
                const isFromCache = response.headers?.['x-data-source'] === 'cache';
                setCacheInfo({ isFromCache, timestamp });
                return response.data || []; // Ensure we always return an array
            }
            catch (error) {
                console.error('Error fetching leaderboard:', error);
                return []; // Return empty array on error
            }
        }
    });
    if (isLoading) {
        return <LoadingSpinner_1.default />;
    }
    if (error) {
        return <div className="alert alert-danger">Error loading standings</div>;
    }
    return (<div className="container-fluid px-3">
      <div className="card">
        <div className="card-body p-0">
          {/* Cache indicator */}
          {cacheInfo.isFromCache && (<div className="alert alert-info m-2">
              <i className="material-icons align-middle">access_time</i>
              <span>Viewing cached standings</span>
              {cacheInfo.timestamp && (<span className="ms-2 text-muted">
                  Last updated: {new Date(cacheInfo.timestamp).toLocaleString()}
                </span>)}
            </div>)}

          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th className="text-center">#</th>
                  <th>Username</th>
                  <th className="text-center">Sends</th>
                  <th className="text-center">Grade</th>
                  <th className="text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {(leaderboard || []).map((entry, index) => (<tr key={entry.username}>
                    <td className="text-center">
                      {index + 1 <= 3 ? (<span className="material-symbols-outlined">
                          counter_{index + 1}
                        </span>) : (index + 1)}
                    </td>
                    <td>{entry.username}</td>
                    <td className="text-center">{entry.totalSends}</td>
                    <td className="text-center">{entry.avgGrade}</td>
                    <td className="text-center">{entry.totalPoints}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>);
};
exports.default = Standings;
