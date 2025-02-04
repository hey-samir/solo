"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const Router_1 = __importDefault(require("./Router"));
const ErrorBoundary_1 = __importDefault(require("./components/ErrorBoundary"));
const Error_1 = __importDefault(require("./components/Error"));
const google_1 = require("@react-oauth/google");
const react_router_dom_1 = require("react-router-dom");
const react_query_1 = require("@tanstack/react-query");
const AuthContext_1 = require("./contexts/AuthContext");
require("bootstrap/dist/css/bootstrap.min.css");
require("./styles/global.css");
const queryClient = new react_query_1.QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
        },
    },
});
const App = () => {
    const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;
    // Debug logging
    console.log('App rendering, current path:', window.location.pathname);
    if (!clientId) {
        console.error('Missing VITE_GOOGLE_OAUTH_CLIENT_ID environment variable');
        return (<div className="vh-100 d-flex align-items-center justify-content-center bg-bg-primary text-text-primary">
        <Error_1.default message="Application configuration error. Please try again later." type="page" retry={() => window.location.reload()}/>
      </div>);
    }
    return (<react_query_1.QueryClientProvider client={queryClient}>
      <react_router_dom_1.BrowserRouter>
        <google_1.GoogleOAuthProvider clientId={clientId}>
          <AuthContext_1.AuthProvider>
            <ErrorBoundary_1.default>
              <div className="min-vh-100 bg-bg-primary text-text-primary">
                <Router_1.default />
              </div>
            </ErrorBoundary_1.default>
          </AuthContext_1.AuthProvider>
        </google_1.GoogleOAuthProvider>
      </react_router_dom_1.BrowserRouter>
    </react_query_1.QueryClientProvider>);
};
exports.default = App;
