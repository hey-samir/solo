import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const environment = import.meta.env.MODE
  const isStaging = environment === 'staging' || process.env.NODE_ENV === 'staging'

  return (
    <header>
      {/* Keep header container for future use but remove unnecessary UI elements */}
      <div className="header-container d-flex justify-content-between align-items-center px-3 py-2">
      </div>
    </header>
  )
}

export default Header