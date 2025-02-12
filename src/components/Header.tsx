import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import soloLogo from '@/assets/images/logos/solo-clear.png'

const Header: React.FC = () => {
  const [isStaging, setIsStaging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Header component mounted, fetching environment...');

    fetch('/api/environment')
      .then(res => {
        console.log('Environment API response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Environment data received:', data);
        const isStaging = data.environment === 'staging';
        console.log('Is staging environment?', isStaging);
        setIsStaging(isStaging);
      })
      .catch(err => {
        console.error('Failed to fetch environment:', err);
        setError(err.message);
        setIsStaging(false);
      });
  }, []);

  return (
    <>
      {isStaging && (
        <div 
          className="fixed top-0 left-0 right-0 bg-black text-white text-center py-2 text-xs z-50"
          style={{ fontFamily: 'Lexend, sans-serif' }}
        >
          Staging Environment {error && `(Error: ${error})`}
        </div>
      )}
      <header 
        className="fixed left-0 right-0 flex items-center justify-between z-40 bg-solo-purple px-4"
        style={{ 
          height: '48px',
          top: isStaging ? '32px' : '0' // Adjust for staging banner
        }}
      >
        {/* Left section - Solo Pro */}
        <div className="flex items-center">
          <Link 
            to="/solo-pro" 
            className="flex items-center text-white hover:text-gray-200"
            aria-label="Solo Pro"
          >
            <i className="material-icons" style={{ fontSize: '24px' }}>star</i>
            <span className="ml-1 text-xs font-semibold">PRO</span>
          </Link>
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
                filter: 'brightness(0) invert(1)' // Makes the logo white
              }}
            />
          </Link>
        </div>

        {/* Right section - Feedback */}
        <div className="flex items-center">
          <Link 
            to="/feedback" 
            className="flex items-center text-white hover:text-gray-200"
            aria-label="Feedback"
            onClick={(e) => {
              e.preventDefault();
              navigate('/feedback');
            }}
          >
            <i className="material-icons" style={{ fontSize: '24px' }}>rate_review</i>
          </Link>
        </div>
      </header>
    </>
  )
}

export default Header