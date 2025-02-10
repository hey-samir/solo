import React from 'react'
import { Link } from 'react-router-dom'
import soloLogo from '../assets/solo.png'

const Header: React.FC = () => {
  return (
    <header 
      className="fixed top-0 left-0 right-0 flex items-center z-40"
      style={{ 
        backgroundColor: 'var(--solo-purple)',
        height: '32px',
        marginTop: '18px'  
      }}
    >
      <div className="px-2">
        <Link to="/" className="flex items-center">
          <img 
            src={soloLogo}
            alt="Solo Logo" 
            className="h-5 w-auto"  
          />
        </Link>
      </div>
    </header>
  )
}

export default Header