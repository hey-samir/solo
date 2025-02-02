import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Header from './Header'

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}

export default Layout