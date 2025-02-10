import React from 'react'
import { Link } from 'react-router-dom'
import soloLogo from '../assets/solo.png'

const Header: React.FC = () => {
  return (
    <header className="bg-dark">
      <div className="header-container d-flex justify-content-between align-items-center px-3 py-2">
        <Link to="/" className="d-inline-block">
          <img 
            src={soloLogo}
            alt="Solo Logo" 
            className="header-logo"
            height="50"
          />
        </Link>
      </div>
    </header>
  )
}

export default Header