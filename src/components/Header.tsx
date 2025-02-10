import React from 'react'
import { Link } from 'react-router-dom'
import soloLogo from '@/assets/images/logos/solo-clear.png'

const Header: React.FC = () => {
  console.log('Logo path:', soloLogo) // Debug the resolved path
  return (
    <header 
      className="fixed top-0 left-0 right-0 flex items-center justify-center z-40"
      style={{ 
        backgroundColor: 'var(--solo-purple)',
        height: '48px'
      }}
    >
      <div className="flex justify-center items-center w-full">
        <Link to="/" className="flex items-center justify-center">
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
        </Link>
      </div>
    </header>
  )
}

export default Header