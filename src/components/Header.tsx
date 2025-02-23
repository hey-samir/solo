import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import soloLogo from '../assets/images/logos/solo-clear.png'
import { useFeatureFlags } from '../contexts/FeatureFlagsContext'

const Header: React.FC = () => {
  const { flags } = useFeatureFlags()
  const navigate = useNavigate()

  const handleFeedbackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/feedback');
  };

  // Only add top padding if environment banner is shown
  const headerStyle = {
    height: '48px',
    top: flags?.showEnvironmentBanner ? '24px' : '0',
    paddingTop: flags?.showEnvironmentBanner ? '0' : '0'
  };

  return (
    <header 
      className="fixed left-0 right-0 flex items-center justify-between z-40 bg-solo-purple px-4"
      style={headerStyle}
    >
      {/* Left section - Solo Pro */}
      <div className="flex items-center">
        {flags?.enablePro && (
          <Link 
            to="/solo-pro" 
            className="flex items-center text-white hover:text-gray-200"
            aria-label="Solo Pro"
          >
            <i className="material-icons" style={{ fontSize: '24px' }}>star</i>
            <span className="ml-1 text-xs font-semibold">PRO</span>
          </Link>
        )}
      </div>

      {/* Center section - Logo */}
      <div className="flex justify-center items-center flex-grow">
        <Link to="/about" className="flex items-center justify-center">
          <img 
            src={soloLogo}
            alt="Solo Logo" 
            className="h-12 w-auto"
            style={{ 
              maxHeight: '42px',
              filter: 'brightness(0) invert(1)'
            }}
          />
        </Link>
      </div>

      {/* Right section - Feedback */}
      <div className="flex items-center">
        {flags?.enableFeedback && (
          <button
            onClick={handleFeedbackClick}
            className="flex items-center text-white hover:text-gray-200 bg-transparent border-0"
            aria-label="Feedback"
          >
            <i className="material-icons" style={{ fontSize: '24px' }}>rate_review</i>
          </button>
        )}
      </div>
    </header>
  )
}

export default Header