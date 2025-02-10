import React from 'react'
import { Outlet } from 'react-router-dom'
import soloLogo from '../assets/images/solo-clear.png'

const ProductionLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {/* Simplified header for production */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-center z-40"
        style={{ 
          backgroundColor: 'var(--solo-purple)',
          height: '48px'
        }}>
        <img 
          src={soloLogo}
          alt="Solo Logo" 
          className="h-12 w-auto"
          style={{ maxHeight: '42px' }}
        />
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8" style={{ marginTop: '66px' }}>
        <Outlet />
      </main>

      {/* Production footer */}
      <footer className="py-4 text-center text-text-secondary">
        <p>Coming Soon to Production</p>
      </footer>
    </div>
  )
}

export default ProductionLayout