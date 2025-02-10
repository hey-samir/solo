import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Header from './Header'
import { config } from '../config/environment'

const Layout: React.FC = () => {
  const isStaging = config.environment === 'staging'

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {isStaging && (
        <div className="bg-solo-purple text-white text-center py-1 text-sm font-semibold">
          Staging Environment
        </div>
      )}
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      {isStaging && <Navbar />}
    </div>
  )
}

export default Layout