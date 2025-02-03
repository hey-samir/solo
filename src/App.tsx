import React from 'react'
import AppRouter from './Router'
import ErrorBoundary from './components/ErrorBoundary'
import Error from './components/Error'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

const App: React.FC = () => {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID

  // Enhanced error logging for missing configuration
  React.useEffect(() => {
    if (!clientId) {
      console.group('Application Configuration Error');
      console.error('Missing required environment variable: VITE_GOOGLE_OAUTH_CLIENT_ID');
      console.error('Current environment:', import.meta.env.MODE);
      console.error('Available env variables:', Object.keys(import.meta.env));
      console.error('Stack:', new Error().stack);
      console.groupEnd();
    }
  }, [clientId]);

  if (!clientId) {
    return (
      <div className="app bg-bg-primary text-text-primary" style={{ minHeight: '100vh' }}>
        <Error
          message="Whoops! Our gear's not properly set up! 🧗‍♂️"
          type="page"
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={clientId}>
          <AuthProvider>
            <ErrorBoundary>
              <div className="app bg-bg-primary text-text-primary" style={{ minHeight: '100vh' }}>
                <AppRouter />
              </div>
            </ErrorBoundary>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App