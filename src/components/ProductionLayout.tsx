import React from 'react'
import { Outlet } from 'react-router-dom'
import soloLogo from '@/assets/images/logos/solo-clear.png'

const ProductionLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {/* Black banner at the top - Made sticky */}
      <div 
        className="fixed top-0 left-0 right-0 bg-black text-white text-center py-2 text-sm z-50"
        style={{ fontFamily: 'Lexend, sans-serif' }}
      >
        Solo is sending soon. Follow @gosolonyc for updates.
      </div>

      {/* Simplified header for production - Adjusted for banner */}
      <header 
        className="fixed left-0 right-0 flex items-center justify-center z-40"
        style={{ 
          backgroundColor: 'var(--solo-purple)',
          height: '48px',
          top: '32px' // Height of the banner
        }}
      >
        <div className="flex justify-center items-center">
          <img 
            src={soloLogo}
            alt="Solo Logo" 
            className="h-12 w-auto"
            style={{ 
              maxHeight: '42px',
              filter: 'brightness(0) invert(1)' // Makes the logo white
            }}
            onError={(e) => {
              console.error('Failed to load logo:', e)
              const img = e.target as HTMLImageElement
              console.log('Attempted image path:', img.src)
            }}
          />
        </div>
      </header>

      {/* Main content - Adjusted margin for fixed header and banner */}
      <main 
        className="flex-grow container mx-auto px-4 py-8" 
        style={{ marginTop: '80px' }} // 32px (banner) + 48px (header) 
      > 
        <Outlet />
      </main>
    </div>
  )
}

export default ProductionLayout