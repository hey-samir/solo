import React from 'react'
import { Link } from 'react-router-dom'
import soloLogo from '../assets/solo.png'

const Header: React.FC = () => {
  return (
    <header className="navbar navbar-dark bg-dark">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <img 
            src={soloLogo}
            alt="Solo Logo" 
            height="40"
            className="d-inline-block align-text-top"
          />
        </Link>
      </div>
    </header>
  )
}

export default Header