import React from 'react'
import AppRouter from './Router'
import ProductionRouter from './ProductionRouter'
import StagingRouter from './StagingRouter'
import ErrorBoundary from './components/ErrorBoundary'
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
  const clientId = process.env.VITE_GOOGLE_OAUTH_CLIENT_ID || ''
  const environment = process.env.NODE_ENV

  // Strict environment checks
  const isProduction = environment === 'production'
  const isStaging = environment === 'staging'

  console.log('Environment:', environment)
  console.log('Is Production:', isProduction)
  console.log('Is Staging:', isStaging)

  // Production mode - minimal setup without Auth and Query providers
  if (isProduction) {
    return (
      <BrowserRouter>
        <ErrorBoundary>
          <ProductionRouter />
        </ErrorBoundary>
      </BrowserRouter>
    )
  }

  // Staging/Development mode - full setup
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={clientId}>
          <AuthProvider>
            <ErrorBoundary>
              <div className="min-vh-100 bg-bg-primary text-text-primary">
                {isStaging ? <StagingRouter /> : <AppRouter />}
              </div>
            </ErrorBoundary>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App