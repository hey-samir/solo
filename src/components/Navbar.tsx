import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar(): React.ReactElement {
  const location = useLocation()

  return (
    <nav className="navbar fixed-bottom">
      <div className="container-fluid">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link 
              to="/profile" 
              className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
            >
              <i className="material-icons">person</i>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/standings" 
              className={`nav-link ${location.pathname === '/standings' ? 'active' : ''}`}
            >
              <i className="material-icons">emoji_events</i>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/sends" 
              className={`nav-link ${location.pathname === '/sends' ? 'active' : ''}`}
            >
              <i className="material-icons">arrow_circle_up</i>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/sessions" 
              className={`nav-link ${location.pathname === '/sessions' ? 'active' : ''}`}
            >
              <i className="material-icons">calendar_today</i>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/stats" 
              className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}
            >
              <i className="material-icons">bar_chart</i>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}