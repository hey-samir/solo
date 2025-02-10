import React from 'react'
import { Outlet } from 'react-router-dom'
import soloLogo from '@/assets/images/solo-clear.svg'

const ProductionLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {/* Black banner at the top */}
      <div className="w-full bg-black text-white text-center py-2 text-sm">
        Solo is sending soon. Follow @gosolonyc for updates.
      </div>

      {/* Simplified header for production */}
      <header className="fixed top-0 left-0 right-0 flex items-center justify-center z-40"
        style={{ 
          backgroundColor: 'var(--solo-purple)',
          height: '48px',
          marginTop: '32px' 
        }}>
        <img 
          src={soloLogo}
          alt="Solo Logo" 
          className="h-12 w-auto"
          style={{ maxHeight: '42px' }}
        />
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8" style={{ marginTop: '98px' }}> 
        <Outlet />
      </main>
    </div>
  )
}

export default ProductionLayout