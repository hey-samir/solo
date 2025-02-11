import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { config, useFeatureFlags } from './config/environment'
import StagingRouter from './StagingRouter'
import ProductionRouter from './ProductionRouter'
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
  const features = useFeatureFlags()
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || ''
  const isStaging = config.environment === 'staging'

  // Add explicit console logs for debugging
  console.log('App Component Render - Current Time:', new Date().toISOString())
  console.log('Current Environment:', config.environment)
  console.log('Enabled Features:', features)


  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={clientId}>
          <AuthProvider>
            <ErrorBoundary>
              {isStaging ? <StagingRouter /> : <ProductionRouter />}
            </ErrorBoundary>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App