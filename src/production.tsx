import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/global.css'

const ProductionApp: React.FC = () => {
  const isProductionDomain = window.location.hostname === 'gosolo.nyc' || 
                           window.location.hostname === 'www.gosolo.nyc';

  // Log the current domain for debugging
  console.log('Current domain:', window.location.hostname);
  console.log('Is production domain?', isProductionDomain);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
          <p className="text-xl text-text-secondary mb-8">
            We're working on something exciting!
          </p>
          <p className="text-sm text-text-muted">
            Solo Climbing Performance Tracking
          </p>
          <div className="mt-8">
            <a 
              href="https://replit.com/@interspace/solo" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-solo-purple hover:text-solo-purple-light transition-colors"
            >
              Follow our progress
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProductionApp />
  </React.StrictMode>,
)