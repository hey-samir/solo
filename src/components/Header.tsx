import React from 'react'
import { Link } from 'react-router-dom'
import soloLogo from '../assets/solo.png'

const Header: React.FC = () => {
  return (
    <header className="navbar navbar-dark py-1" style={{ backgroundColor: 'var(--solo-purple)' }}>
      <div className="container-fluid px-2">
        <Link to="/" className="navbar-brand m-0 p-0">
          <img 
            src={soloLogo}
            alt="Solo Logo" 
            height="20"
            className="d-inline-block"
            style={{ objectFit: 'contain' }}
          />
        </Link>
      </div>
    </header>
  )
}

export default Header