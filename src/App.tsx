import React, { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import { config, FeatureFlagService } from './config/environment'
import Router from './Router'
import LoadingSpinner from './components/LoadingSpinner'
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
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || ''
  const [isLoading, setIsLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await FeatureFlagService.initialize()
        console.log('Feature flags initialized:', FeatureFlagService.getFlags())
      } catch (error) {
        console.error('Failed to initialize feature flags:', error)
        setInitError('Failed to load application configuration')
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600">{initError}</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={clientId}>
          <AuthProvider>
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App