import React from 'react'
import { Link } from 'react-router-dom'
import soloLogo from '../assets/solo.png'

const Header: React.FC = () => {
  return (
    <nav className="navbar navbar-dark bg-dark">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand">
          <img 
            src={soloLogo}
            alt="Solo Logo" 
            height="40"
            className="d-inline-block align-text-top"
          />
        </Link>
      </div>
    </nav>
  )
}

export default Header