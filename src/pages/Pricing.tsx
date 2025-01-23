import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Pricing: FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const handleUpgrade = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing')
    } else {
      // TODO: Implement upgrade flow
      console.log('Upgrade to Pro')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-center mb-8">Choose Your Plan</h1>

      <div className="table-responsive">
        <table className="table table-dark table-borderless mb-0">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Features</th>
              <th className="text-center" style={{ width: '25%' }}>
                <h3 className="mb-2">Base</h3>
                <div className="d-grid">
                  <button 
                    onClick={() => navigate('/register')}
                    className="btn btn-outline-light"
                  >
                    Start Free
                  </button>
                </div>
              </th>
              <th className="text-center" style={{ width: '25%' }}>
                <h3 className="mb-2"><span className="pro-badge">PRO</span></h3>
                <div className="d-grid">
                  <button 
                    onClick={handleUpgrade}
                    className="btn btn-solo-purple"
                  >
                    Start Free Trial
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Send Logging</td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
            </tr>
            <tr>
              <td>Global Leaderboard</td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
            </tr>
            <tr>
              <td>Session View</td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
            </tr>
            <tr>
              <td>Stats Tracking</td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
            </tr>
            <tr>
              <td>Ad-free Experience</td>
              <td className="text-center"><i className="material-icons text-error">close</i></td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
            </tr>
            <tr>
              <td>Custom Avatars</td>
              <td className="text-center"><i className="material-icons text-error">close</i></td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
            </tr>
            <tr>
              <td>Solo AI</td>
              <td className="text-center"><i className="material-icons text-error">close</i></td>
              <td className="text-center"><i className="material-icons text-success">check</i></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Pricing