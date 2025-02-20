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
      {/* Environment Banner */}
      {flags?.showEnvironmentBanner && (
        <div 
          className="fixed top-0 left-0 right-0 text-white text-center text-xs py-0.5 font-semibold bg-black z-50"
        >
          {flags.environmentBannerText}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-center w-full bg-solo-purple">
        <div className="w-full max-w-[430px]">
          <Header />
        </div>
      </div>

      {/* Main Content */}
      <main 
        className="flex-grow container mx-auto px-4 py-8" 
        style={{ 
          marginTop: flags?.showEnvironmentBanner ? '80px' : '48px',
          marginBottom: flags?.showBottomNav ? '60px' : '0'
        }}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[430px]">
          <Footer />
        </div>
      </div>

      {/* Bottom Navigation */}
      {flags?.showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center bg-bg-primary">
          <div className="w-full max-w-[430px]">
            <Navbar />
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout