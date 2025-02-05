import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ErrorBoundary from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'
import AppRouter from './Router'
import { config, useFeatureFlags } from './config/environment'
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

  // Add explicit console logs for debugging
  console.log('App Component Render - Current Time:', new Date().toISOString())
  console.log('Current Environment:', config.environment)
  console.log('Enabled Features:', features)

  // If coming soon is enabled, show minimal version
  if (features.showComingSoon) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
            <p className="text-xl text-text-secondary mb-8">
              We're working on something exciting!
            </p>
            <p className="text-sm text-text-muted">
              Solo Climbing Performance Tracking
            </p>
            <div className="mt-8">
              <a 
                href="https://replit.com/@interspace/solo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-solo-purple hover:text-solo-purple-light transition-colors"
              >
                Follow our progress
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Full application with feature flags
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={clientId}>
          <AuthProvider>
            <ErrorBoundary>
              <div className="min-vh-100 bg-bg-primary text-text-primary">
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