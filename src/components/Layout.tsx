import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navbar from './Navbar'
import { config } from '../config/environment'

const Layout: React.FC = () => {
  const isStaging = config.environment === 'staging'

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {isStaging && (
        <div 
          className="fixed top-0 left-0 right-0 text-white text-center text-xs py-0.5 font-semibold bg-black z-50"
        >
          Staging Environment
        </div>
      )}
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8" style={{ marginTop: '66px' }}>
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}

export default Layout