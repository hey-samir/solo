import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar(): React.ReactElement {
  const location = useLocation()

  return (
    <nav className="navbar fixed-bottom">
      <div className="container-fluid">
        <ul className="navbar-nav w-100 d-flex flex-row justify-content-around">
          <li className="nav-item">
            <Link 
              to="/squads" 
              className={`nav-link ${location.pathname === '/squads' ? 'active' : ''}`}
            >
              <i className="material-icons">group</i>
              <span className="nav-label">Squads</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/standings" 
              className={`nav-link ${location.pathname === '/standings' ? 'active' : ''}`}
            >
              <i className="material-icons">emoji_events</i>
              <span className="nav-label">Standings</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/sends" 
              className={`nav-link ${location.pathname === '/sends' ? 'active' : ''}`}
            >
              <i className="material-icons">arrow_circle_up</i>
              <span className="nav-label">Sends</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/sessions" 
              className={`nav-link ${location.pathname === '/sessions' ? 'active' : ''}`}
            >
              <i className="material-icons">calendar_today</i>
              <span className="nav-label">Sessions</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/stats" 
              className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}
            >
              <i className="material-icons">bar_chart</i>
              <span className="nav-label">Stats</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}