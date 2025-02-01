import React from 'react'
import AppRouter from './Router'
import ErrorBoundary from './components/ErrorBoundary'
import { GoogleOAuthProvider } from '@react-oauth/google'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

const App: React.FC = () => {
  const clientId = process.env.VITE_GOOGLE_OAUTH_CLIENT_ID || ''
  console.log('App component rendering') // Debug log

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ErrorBoundary>
        <div className="app" style={{ minHeight: '100vh' }}>
          <AppRouter />
        </div>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  )
}

export default App