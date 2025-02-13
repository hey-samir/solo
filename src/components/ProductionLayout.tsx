import React from 'react'
import { Outlet } from 'react-router-dom'
import soloLogo from '@/assets/images/logos/solo-clear.png'

const ProductionLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-cover bg-center bg-fixed" 
      style={{ 
        backgroundImage: 'url("/attached_assets/photo-1548163168-3367ff6a0ba6.avif")',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center'
      }}>
      {/* Mobile app container - fixed width */}
      <div className="relative w-full" style={{ maxWidth: '270px', position: 'relative', overflow: 'hidden' }}>
        {/* Fixed position container for top elements */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2" style={{ width: '270px' }}>
          {/* Black banner at the top */}
          <div 
            className="w-full h-8 bg-black text-white text-center py-2 text-sm"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          >
            Solo is sending soon. Follow @gosolonyc for updates.
          </div>

          {/* Header for production */}
          <header 
            className="w-full flex items-center justify-center bg-solo-purple"
            style={{ height: '48px' }}
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
        </div>

        {/* Main content */}
        <main 
          className="flex-grow w-full px-4 py-8 bg-bg-primary" 
          style={{ 
            marginTop: '80px',
            minHeight: 'calc(100vh - 80px)',
            maxWidth: '270px'
          }}
        > 
          <Outlet />
        </main>

        {/* Bottom Navigation - If enabled */}
        <nav 
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-bg-primary border-t border-border-color"
          style={{ maxWidth: '270px' }}
        >
          <div className="flex justify-around items-center h-14">
            {/* Navigation items go here */}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default ProductionLayout