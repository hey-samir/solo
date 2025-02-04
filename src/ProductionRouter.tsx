import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ComingSoon from './pages/ComingSoon'

const ProductionRouter: React.FC = () => {
  console.log('Production router rendering') // Debug log

  // Production router only shows the Coming Soon page without any navigation
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* No header or navigation */}
      <main className="flex-grow flex items-center justify-center">
        <Routes>
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </main>
    </div>
  )
}

export default ProductionRouter