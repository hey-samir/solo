import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from './Router'
import './styles/global.css'  // Load our custom styles last to override Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'

const App: React.FC = () => {
  console.log('App component rendering...') // Add logging for debugging
  return (
    <Router>
      <AppRouter />
    </Router>
  )
}

export default App