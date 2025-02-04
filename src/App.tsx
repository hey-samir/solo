import React from 'react'
import AppRouter from './Router'
import ProductionRouter from './ProductionRouter'
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
  const env = import.meta.env.MODE

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GoogleOAuthProvider clientId={clientId || ''}>
          <AuthProvider>
            <ErrorBoundary>
              <div className="min-vh-100 bg-bg-primary text-text-primary">
                {env === 'production' ? <ProductionRouter /> : <AppRouter />}
              </div>
            </ErrorBoundary>
          </AuthProvider>
        </GoogleOAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App