import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from './Router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'  // Load our custom styles last to override Bootstrap

const App: React.FC = () => {
  console.log('App component mounting...')  // Added mounting log

  React.useEffect(() => {
    // Clean up any query parameters and handle initialPath
    const url = new URL(window.location.href)
    const initialPath = url.searchParams.get('initialPath')

    // Remove all query parameters and use initialPath if present
    if (initialPath) {
      window.history.replaceState({}, '', initialPath)
    } else if (url.search) {
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