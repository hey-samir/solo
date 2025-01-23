import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRouter from './Router'

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <AppRouter />
      </div>
    </Router>
  )
}

export default App