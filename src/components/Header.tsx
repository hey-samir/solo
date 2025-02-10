import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import soloLogo from '../assets/solo.png'

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const environment = import.meta.env.MODE
  const isStaging = environment === 'staging' || process.env.NODE_ENV === 'staging'

  return (
    <header>
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