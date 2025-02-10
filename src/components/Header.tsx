import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import soloLogo from '../assets/solo.png'

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const environment = import.meta.env.MODE
  const isStaging = environment === 'staging' || process.env.NODE_ENV === 'staging'

  // Add debug logs for environment and auth state
  console.log('Current environment:', environment)
  console.log('Authentication state:', { isAuthenticated, user })

  return (
    <header className="bg-solo-purple">
      <div className="header-container d-flex justify-content-between align-items-center px-3 py-2">
        <Link to="/" className="d-inline-block">
          <img 
            src={soloLogo}
            alt="Solo Logo" 
            className="header-logo"
            height="50"
            onError={(e) => {
              console.error('Logo failed to load:', e)
              e.currentTarget.onerror = null
            }}
          />
        </Link>
      </div>
    </header>
  )
}

export default Header