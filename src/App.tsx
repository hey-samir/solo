import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from './Router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

const App: React.FC = () => {
  React.useEffect(() => {
    // Simplified URL cleanup - just remove any query parameters
    const url = new URL(window.location.href)
    if (url.search) {
      window.history.replaceState({}, '', url.pathname)
    }
  }, [])

  return (
    <Router>
      <div className="app">
        <AppRouter />
      </div>
    </Router>
  )
}

export default App