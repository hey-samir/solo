import React from 'react'
import AppRouter from './Router'
import ErrorBoundary from './components/ErrorBoundary'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

const App: React.FC = () => {
  console.log('App component rendering') // Debug log

  return (
    <ErrorBoundary>
      <div className="app" style={{ minHeight: '100vh' }}>
        <AppRouter />
      </div>
    </ErrorBoundary>
  )
}

export default App