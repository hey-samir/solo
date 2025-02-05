import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ComingSoon from './pages/ComingSoon'
import ProductionLayout from './components/ProductionLayout'

const ProductionRouter: React.FC = () => {
  console.log('Production router rendering') // Debug log

  return (
    <Routes>
      <Route element={<ProductionLayout />}>
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  )
}

export default ProductionRouter