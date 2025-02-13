import React from 'react'
import { Outlet } from 'react-router-dom'
import soloLogo from '@/assets/images/logos/solo-clear.png'

const ProductionLayout: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex justify-center bg-cover bg-center bg-fixed" 
      style={{ backgroundImage: 'url("/attached_assets/photo-1548163168-3367ff6a0ba6.avif")' }}>
      {/* Mobile container - strictly 270px */}
      <div className="w-[270px] min-h-screen relative bg-bg-primary">
        {/* Banner */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-black text-white text-center py-2 text-sm z-50">
          Solo is sending soon. Follow @gosolonyc for updates.
        </div>

        {/* Header */}
        <div className="absolute top-8 left-0 right-0 h-12 bg-solo-purple flex items-center justify-center z-40">
          <img 
            src={soloLogo}
            alt="Solo Logo" 
            className="h-10 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>

        {/* Main content */}
        <div className="pt-20 px-4 pb-16"> 
          <Outlet />
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-bg-primary border-t border-border-color">
          <div className="flex justify-around items-center h-full">
            {/* Navigation items go here */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductionLayout