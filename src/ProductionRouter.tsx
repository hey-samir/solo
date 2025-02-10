import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProductionLayout from './components/ProductionLayout'
import LoadingSpinner from './components/LoadingSpinner'
import About from './pages/About'
import ComingSoon from './pages/ComingSoon'

const ProductionRouter: React.FC = () => {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route element={<ProductionLayout />}>
          {/* Production only shows About and Coming Soon pages */}
          <Route index element={<About />} />
          <Route path="about" element={<About />} />
          {/* All other routes show ComingSoon */}
          <Route path="*" element={<ComingSoon />} />
        </Route>
      </Routes>
    </React.Suspense>
  )
}

export default ProductionRouter