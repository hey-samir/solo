import React from 'react'
import { Outlet } from 'react-router-dom'
import soloLogo from '@/assets/images/logos/solo-clear.png'

const ProductionLayout: React.FC = () => {
  return (
    // Outer container with background - allow full width
    <div style={{ 
      width: '100%',
      minHeight: '100vh',
      backgroundImage: 'url("/attached_assets/photo-1548163168-3367ff6a0ba6.avif")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      display: 'flex',
      justifyContent: 'center',
      overflowX: 'hidden' // Prevent horizontal scroll
    }}>
      {/* App container - strict 270px width */}
      <div style={{ 
        width: '270px',
        maxWidth: '270px', // Redundant but ensures strictness
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden',
        flexShrink: 0, // Prevent shrinking
        flexGrow: 0, // Prevent growing
      }}>
        {/* Banner */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '270px',
          maxWidth: '270px',
          height: '32px',
          backgroundColor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          overflow: 'hidden'
        }}>
          <span style={{ 
            color: 'white',
            fontSize: '14px',
            fontFamily: 'Lexend, sans-serif'
          }}>
            Solo is sending soon. Follow @gosolonyc for updates.
          </span>
        </div>

        {/* Header */}
        <div style={{
          position: 'absolute',
          top: '32px',
          left: 0,
          width: '270px',
          maxWidth: '270px',
          height: '48px',
          backgroundColor: 'var(--solo-purple)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40,
          overflow: 'hidden'
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
          width: '270px',
          maxWidth: '270px',
          minHeight: '100vh',
          paddingTop: '80px',
          paddingBottom: '56px',
          paddingLeft: '16px',
          paddingRight: '16px',
          overflow: 'hidden'
        }}>
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '270px',
          maxWidth: '270px',
          height: '56px',
          backgroundColor: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          {/* Navigation items go here */}
        </div>
      </div>
    </div>
  )
}

export default ProductionLayout