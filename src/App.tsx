import React from 'react'
import AppRouter from './Router'
import ErrorBoundary from './components/ErrorBoundary'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

const App: React.FC = () => {
  const clientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID

  if (!clientId) {
    console.error('Missing GOOGLE_OAUTH_CLIENT_ID environment variable')
    return (
      <div className="app bg-bg-primary text-text-primary" style={{ minHeight: '100vh' }}>
        <div className="alert alert-danger">
          Application configuration error. Please contact support.
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <GoogleOAuthProvider clientId={clientId}>
        <ErrorBoundary>
          <div className="app bg-bg-primary text-text-primary" style={{ minHeight: '100vh' }}>
            <AppRouter />
          </div>
        </ErrorBoundary>
      </GoogleOAuthProvider>
    </BrowserRouter>
  )
}

export default App