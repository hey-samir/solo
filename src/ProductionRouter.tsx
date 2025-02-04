import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ComingSoon from './pages/ComingSoon'

// Simplified layout without header menu for production
const ProductionLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      <main className="flex-grow container mx-auto px-4 py-8">
        <ComingSoon />
      </main>
    </div>
  )
}

const ProductionRouter: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProductionLayout />}>
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  )
}

export default ProductionRouter
