import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Header from './Header'

const Layout: React.FC = () => {
  console.log('Layout rendering') // Debug log

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {/* Staging Environment Banner */}
      <div className="bg-black text-white text-center py-1 text-sm">
        Staging Environment
      </div>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}

export default Layout