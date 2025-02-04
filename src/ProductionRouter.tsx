import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ComingSoon from './pages/ComingSoon'

const ProductionRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="*" element={<ComingSoon />} />
    </Routes>
  )
}

export default ProductionRouter