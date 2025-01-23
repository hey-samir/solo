import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Header from './Header'

const Layout: React.FC = () => {
  console.log('Layout component rendering...') // Add debugging log

  return (
    <div className="app">
      <Header />
      <main className="container">
        <Outlet />
      </main>
      <Navbar />
    </div>
  )
}

export default Layout