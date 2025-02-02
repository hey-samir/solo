import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-solo-purple">
        <div className="header-container d-flex justify-content-between align-items-center px-3 py-2">
          <Link to="/" className="d-inline-block">
            <img 
              src="/attached_assets/solo.png"
              alt="Solo Logo" 
              className="header-logo"
              height="50"
            />
          </Link>
          <div className="d-flex align-items-center">
            <button 
              className="btn menu-toggle" 
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <i className="material-icons">menu</i>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Menu */}
      <div className={`offcanvas offcanvas-end ${isMenuOpen ? 'show' : ''}`} tabIndex={-1} id="menuSidebar">
        <div className="offcanvas-header">
          <button 
            type="button" 
            className="btn-close text-white" 
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          />
        </div>
        <div className="offcanvas-body px-3 pt-0">
          <div className="list-group list-group-flush">
            {/* Profile link - always visible but with different behavior based on auth */}
            <Link 
              to="/profile/@gosolonyc"
              className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="material-icons">mood</i>
              <span className="ms-3">Profile</span>
            </Link>

            <Link 
              to="/about"
              className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="material-icons">help</i>
              <span className="ms-3">About</span>
            </Link>

            <Link 
              to="/feedback"
              className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="material-icons">rate_review</i>
              <span className="ms-3">Feedback</span>
            </Link>

            {/* Solo Pro link - always visible */}
            <Link 
              to="/pricing"
              className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              <i className="material-icons">star</i>
              <span className="ms-3 d-flex align-items-center">
                Solo <span className="pro-badge ms-1">PRO</span>
              </span>
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white"
              >
                <i className="material-icons">logout</i>
                <span className="ms-3">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="list-group-item list-group-item-action d-flex align-items-center bg-transparent border-0 text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                <i className="material-icons">login</i>
                <span className="ms-3">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="offcanvas-backdrop fade show" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  )
}

export default Header