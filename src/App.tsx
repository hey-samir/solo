import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from './Router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'  // Load our custom styles last to override Bootstrap

const App: React.FC = () => {
  console.log('App component mounting...')  // Added mounting log

  React.useEffect(() => {
    console.log('App component mounted')
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