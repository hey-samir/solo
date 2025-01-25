import React from 'react'
import AppRouter from './Router'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

const App: React.FC = () => {
  return (
    <div className="app">
      <AppRouter />
    </div>
  )
}

export default App