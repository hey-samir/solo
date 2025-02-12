import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Import all avatars
import graySoloAvatar from '@/assets/images/avatars/gray-solo-av.png'
import whiteSoloAvatar from '@/assets/images/avatars/white-solo-av.png'
import blackSoloAvatar from '@/assets/images/avatars/black-solo-av.png'
import purpleSoloAvatar from '@/assets/images/avatars/purple-solo-av.png'

const avatarMap = {
  gray: graySoloAvatar,
  white: whiteSoloAvatar,
  black: blackSoloAvatar,
  purple: purpleSoloAvatar
} as const

export default function Navbar(): React.ReactElement {
  const location = useLocation()
  const { user } = useAuth()

  // Default to gray avatar if no profilePhoto is set
  const currentAvatar = user?.profilePhoto ? avatarMap[user.profilePhoto as keyof typeof avatarMap] : graySoloAvatar

  return (
    <nav className="navbar fixed-bottom">
      <div className="container-fluid">
        <ul className="navbar-nav w-100 d-flex flex-row justify-content-around">
          <li className="nav-item">
            <Link 
              to="/squads" 
              className={`nav-link ${location.pathname === '/squads' ? 'active' : ''}`}
              aria-label="Squads"
            >
              <i className="material-icons" style={{ fontSize: '28px' }}>group</i>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/standings" 
              className={`nav-link ${location.pathname === '/standings' ? 'active' : ''}`}
              aria-label="Standings"
            >
              <i className="material-icons" style={{ fontSize: '28px' }}>emoji_events</i>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/sends" 
              className={`nav-link ${location.pathname === '/sends' ? 'active' : ''}`}
              aria-label="Sends"
            >
              <i className="material-icons" style={{ fontSize: '28px' }}>arrow_circle_up</i>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/sessions" 
              className={`nav-link ${location.pathname === '/sessions' ? 'active' : ''}`}
              aria-label="Sessions"
            >
              <i className="material-icons" style={{ fontSize: '28px' }}>calendar_today</i>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/stats" 
              className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}
              aria-label="Stats"
            >
              <i className="material-icons" style={{ fontSize: '28px' }}>bar_chart</i>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/solo" 
              className={`nav-link ${['/solo', '/settings', '/profile'].includes(location.pathname) ? 'active' : ''}`}
              aria-label="Solo"
            >
              <img 
                src={currentAvatar}
                alt="Solo" 
                style={{ 
                  width: '36px', 
                  height: '36px',
                  opacity: ['/solo', '/settings', '/profile'].includes(location.pathname) ? 1 : 0.85 
                }} 
              />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}