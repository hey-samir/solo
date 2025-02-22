import React from 'react'
import { Outlet } from 'react-router-dom'
import soloLogo from '../assets/images/logos/solo-clear.png'
import Footer from './Footer'

const ProductionLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {/* Environment Banner */}
      <div 
        className="fixed top-0 left-0 right-0 text-white text-center text-xs py-0.5 font-semibold bg-black z-50"
      >
        Solo is sending soon. Follow @gosolonyc for updates
      </div>

      {/* Header */}
      <header 
        className="fixed left-0 right-0 flex items-center justify-center z-40 bg-solo-purple"
        style={{ 
          height: '48px',
          top: '24px'
        }}
      >
        <img 
          src={soloLogo}
          alt="Solo Logo" 
          className="h-12 w-auto"
          style={{ 
            maxHeight: '42px',
            filter: 'brightness(0) invert(1)'
          }}
        />
      </header>

      {/* Main Content */}
      <main 
        className="flex-grow container mx-auto px-4 py-8" 
        style={{ 
          marginTop: '80px',
          marginBottom: '20px', 
        }}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default ProductionLayout