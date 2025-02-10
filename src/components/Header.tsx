import React from 'react'
import { Link } from 'react-router-dom'
import soloLogo from '@/assets/images/logos/solo-clear.png'

const Header: React.FC = () => {
  const isStaging = process.env.VITE_USER_NODE_ENV === 'staging'

  return (
    <>
      {isStaging && (
        <div 
          className="fixed top-0 left-0 right-0 bg-black text-white text-center py-2 text-sm z-50"
          style={{ fontFamily: 'Lexend, sans-serif' }}
        >
          Staging Environment
        </div>
      )}
      <header 
        className="fixed left-0 right-0 flex items-center justify-center z-40 bg-solo-purple"
        style={{ 
          height: '48px',
          top: isStaging ? '32px' : '0' // Adjust for staging banner
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
            />
          </Link>
        </div>
      </header>
    </>
  )
}

export default Header