import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Header from './Header'

const Layout: React.FC = () => {
  console.log('Layout component rendering...') // Add debugging log

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}

export default Layout