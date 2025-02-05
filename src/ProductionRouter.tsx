import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ComingSoon from './pages/ComingSoon'

const ProductionRouter: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
      <main className="flex-grow flex items-center justify-center">
        <ComingSoon />
      </main>
    </div>
  )
}

export default ProductionRouter