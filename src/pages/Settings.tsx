import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from '../components/ui/card'

const Settings: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="container py-4">
      <h1 className="text-white mb-4">Settings</h1>

      <Card className="mb-4">
        <div className="p-3">
          <h5 className="text-white mb-3">Account Settings</h5>
          {user ? (
            <div>
              <p className="mb-2 text-white-50"><strong className="text-white">Username:</strong> {user.username}</p>
              <p className="mb-2 text-white-50"><strong className="text-white">Email:</strong> {user.email}</p>
            </div>
          ) : (
            <p className="text-white-50">Please log in to view your account settings.</p>
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