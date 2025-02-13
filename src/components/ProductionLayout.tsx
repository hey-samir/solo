import React from 'react'
import { Outlet } from 'react-router-dom'
import soloLogo from '@/assets/images/logos/solo-clear.png'

const ProductionLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-fixed" 
      style={{ 
        backgroundImage: 'url("/attached_assets/photo-1548163168-3367ff6a0ba6.avif")',
        minHeight: '100vh'
      }}>
      <div className="mx-auto" style={{ maxWidth: '270px' }}>
        {/* Black banner at the top - Made sticky */}
        <div 
          className="fixed top-0 left-0 right-0 bg-black text-white text-center py-2 text-sm z-50"
          style={{ 
            fontFamily: 'Lexend, sans-serif',
            maxWidth: '270px',
            margin: '0 auto',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          Solo is sending soon. Follow @gosolonyc for updates.
        </div>

        {/* Header for production - Adjusted for banner */}
        <header 
          className="fixed left-0 right-0 flex items-center justify-center z-40 bg-solo-purple"
          style={{ 
            height: '48px',
            top: '32px', // Height of the banner
            maxWidth: '270px',
            margin: '0 auto',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="flex justify-center items-center">
            <img 
              src={soloLogo}
              alt="Solo Logo" 
              className="h-12 w-auto"
              style={{ 
                maxHeight: '42px',
                filter: 'brightness(0) invert(1)'
              }}
            />
          </div>
        </header>

        {/* Main content - Adjusted margin for fixed header and banner */}
        <main 
          className="flex-grow container mx-auto px-4 py-8 bg-bg-primary" 
          style={{ 
            marginTop: '96px',
            minHeight: 'calc(100vh - 96px)'
          }}
        > 
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default ProductionLayout