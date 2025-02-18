import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navbar from './Navbar'
import Footer from './Footer'
import { config } from '../config/environment'
import { useFeatureFlags } from '../contexts/FeatureFlagsContext'

const Layout: React.FC = () => {
  const { flags } = useFeatureFlags()
  const isStaging = config.environment === 'staging'

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {flags?.showEnvironmentBanner && (
        <div 
          className="fixed top-0 left-0 right-0 text-white text-center text-xs py-0.5 font-semibold bg-black z-50"
        >
          {flags.environmentBannerText || 'Solo is sending soon. Follow @gosolonyc for updates'}
        </div>
      )}
      <Header />
      <main 
        className="flex-grow container mx-auto px-4 py-8" 
        style={{ 
          marginTop: flags?.showEnvironmentBanner ? '80px' : '48px',  
        }}
      >
        <Outlet />
      </main>
      <div style={{ marginBottom: flags?.showBottomNav ? '60px' : '0' }}>
        <Footer />
      </div>
      {flags?.showBottomNav && <Navbar />}
    </div>
  )
}

export default Layout