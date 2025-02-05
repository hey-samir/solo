import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ProductionLayout from './components/ProductionLayout'
import ComingSoon from './pages/ComingSoon'

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