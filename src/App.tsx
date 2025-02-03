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

  // Debug logging
  console.log('App rendering, current path:', window.location.pathname);

  if (!clientId) {
    console.error('Missing VITE_GOOGLE_OAUTH_CLIENT_ID environment variable');
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-bg-primary text-text-primary">
        <Error
          message="Application configuration error. Please try again later."
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