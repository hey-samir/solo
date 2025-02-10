import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/card'
import { Link } from 'react-router-dom'

const Settings: React.FC = () => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="container py-4">
      <h1 className="text-white mb-4">Settings</h1>

      <Card className="mb-4">
        <div className="p-3">
          <h5 className="text-white mb-3">Account</h5>
          {user ? (
            <div className="d-flex flex-column gap-2">
              <Link to="/profile" className="text-white text-decoration-none">
                <i className="material-icons align-middle me-2">person</i>
                Profile
              </Link>
              <Link to="/about" className="text-white text-decoration-none">
                <i className="material-icons align-middle me-2">info</i>
                About
              </Link>
              <Link to="/feedback" className="text-white text-decoration-none">
                <i className="material-icons align-middle me-2">feedback</i>
                Feedback
              </Link>
              <Link to="/pricing" className="text-white text-decoration-none">
                <i className="material-icons align-middle me-2">stars</i>
                Solo Pro
              </Link>
              <button 
                onClick={handleLogout}
                className="btn btn-link text-white text-decoration-none p-0 text-start"
              >
                <i className="material-icons align-middle me-2">logout</i>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-white text-decoration-none">
              <i className="material-icons align-middle me-2">login</i>
              Login
            </Link>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-3">
          <h5 className="text-white mb-3">Preferences</h5>
          <p className="text-white-50">More settings coming soon...</p>
        </div>
      </Card>
    </div>
  )
}

export default Settings