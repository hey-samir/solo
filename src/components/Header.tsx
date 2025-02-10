import React from 'react'
import { Link } from 'react-router-dom'
import soloLogo from '@/assets/images/logos/solo-clear.png'

const Header: React.FC = () => {
  const isStaging = process.env.VITE_USER_NODE_ENV === 'staging'

  return (
    <header 
      className="fixed top-0 left-0 right-0 flex items-center justify-center z-40"
      style={{ 
        backgroundColor: 'var(--solo-purple)',
        height: '48px',
        top: isStaging ? '32px' : '0', // Increased space for staging banner (32px instead of 24px)
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