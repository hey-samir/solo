import React from 'react'
import { Outlet } from 'react-router-dom'
import soloLogo from '@/assets/images/logos/solo-clear.png'

const ProductionLayout: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex justify-center bg-cover bg-center bg-fixed overflow-hidden" 
      style={{ backgroundImage: 'url("/attached_assets/photo-1548163168-3367ff6a0ba6.avif")' }}>

      {/* Strict width container - no exceptions */}
      <div style={{ 
        width: '270px',
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden' // Prevent content from breaking out
      }}>
        {/* Banner - contained within parent width */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '270px',
          height: '32px',
          backgroundColor: 'black',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ 
            color: 'white',
            fontSize: '14px',
            fontFamily: 'Lexend, sans-serif'
          }}>
            Solo is sending soon. Follow @gosolonyc for updates.
          </span>
        </div>

        {/* Header - contained within parent width */}
        <div style={{
          position: 'absolute',
          top: '32px',
          left: 0,
          width: '270px',
          height: '48px',
          backgroundColor: 'var(--solo-purple)',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={soloLogo}
            alt="Solo Logo" 
            style={{ 
              height: '40px',
              width: 'auto',
              filter: 'brightness(0) invert(1)'
            }}
          />
        </div>

        {/* Main content area */}
        <div style={{
          paddingTop: '80px', // Banner + Header height
          paddingBottom: '56px', // Bottom nav height
          paddingLeft: '16px',
          paddingRight: '16px',
          width: '270px',
          minHeight: '100vh'
        }}>
          <Outlet />
        </div>

        {/* Bottom Navigation - contained within parent width */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '270px',
          height: '56px',
          backgroundColor: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}>
          {/* Navigation items go here */}
        </div>
      </div>
    </div>
  )
}

export default ProductionLayout