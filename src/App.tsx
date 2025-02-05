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

declare global {
  interface ImportMetaEnv {
    VITE_GOOGLE_OAUTH_CLIENT_ID: string
    MODE: string
  }
}

const App: React.FC = () => {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID
  const environment = import.meta.env.MODE
  const isProduction = environment === 'production' && process.env.NODE_ENV === 'production'
  const isStaging = environment === 'staging' || process.env.NODE_ENV === 'staging'

  console.log('App Environment:', environment)
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('Router Mode:', isProduction ? 'Production' : isStaging ? 'Staging' : 'Development')

  const getRouter = () => {
    if (isProduction) return <ProductionRouter />
    if (isStaging) return <StagingRouter />
    return <AppRouter />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={clientId || ''}>
          <AuthProvider>
            <ErrorBoundary>
              <div className="min-vh-100 bg-bg-primary text-text-primary">
                {getRouter()}
              </div>
            </ErrorBoundary>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App