import React from 'react'
import { Link } from 'react-router-dom'
import soloLogo from '../assets/solo.png'

const Header: React.FC = () => {
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
            className="h-12 w-auto"  // Increased logo height
            style={{ maxHeight: '42px' }}  // Ensure logo fits within navbar
          />
        </Link>
      </div>
    </header>
  )
}

export default Header