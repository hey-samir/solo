import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ComingSoon from './pages/ComingSoon'

const ProductionRouter: React.FC = () => {
  // Production router only shows the Coming Soon page without any navigation
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      <main className="flex-grow">
        <Routes>
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </main>
    </div>
  )
}

export default ProductionRouter