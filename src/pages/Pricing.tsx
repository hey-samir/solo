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
      <h1 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Tier */}
        <div className="pricing-card">
          <div className="pricing-header">
            <h2 className="text-2xl font-bold mb-2">Free</h2>
            <p className="text-4xl font-bold mb-4">$0<span className="text-xl font-normal">/mo</span></p>
            <p className="text-gray-600">Perfect for getting started</p>
          </div>
          
          <div className="pricing-content">
            <ul className="feature-list">
              <li>
                <i className="material-icons text-green-500">check_circle</i>
                <span>Unlimited climb logging</span>
              </li>
              <li>
                <i className="material-icons text-green-500">check_circle</i>
                <span>Basic statistics</span>
              </li>
              <li>
                <i className="material-icons text-green-500">check_circle</i>
                <span>Route tracking</span>
              </li>
              <li>
                <i className="material-icons text-green-500">check_circle</i>
                <span>Community features</span>
              </li>
            </ul>
            
            <div className="pricing-cta">
              <button 
                onClick={() => navigate('/register')}
                className="btn btn-outline-primary w-full"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>

        {/* Pro Tier */}
        <div className="pricing-card pro">
          <div className="pricing-header">
            <h2 className="text-2xl font-bold mb-2">Pro</h2>
            <p className="text-4xl font-bold mb-4">$5<span className="text-xl font-normal">/mo</span></p>
            <p className="text-gray-200">For serious climbers</p>
          </div>
          
          <div className="pricing-content">
            <ul className="feature-list">
              <li>
                <i className="material-icons text-green-500">check_circle</i>
                <span>Everything in Free</span>
              </li>
              <li>
                <i className="material-icons text-green-500">check_circle</i>
                <span>Advanced analytics</span>
              </li>
              <li>
                <i className="material-icons text-green-500">check_circle</i>
                <span>Training plans</span>
              </li>
              <li>
                <i className="material-icons text-green-500">check_circle</i>
                <span>Video beta sharing</span>
              </li>
              <li>
                <i className="material-icons text-green-500">check_circle</i>
                <span>Progress tracking</span>
              </li>
              <li>
                <i className="material-icons text-green-500">check_circle</i>
                <span>Priority support</span>
              </li>
            </ul>
            
            <div className="pricing-cta">
              <button 
                onClick={handleUpgrade}
                className="btn btn-primary w-full"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
