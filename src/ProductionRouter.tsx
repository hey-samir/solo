import React from 'react'
import { Routes, Route } from 'react-router-dom'

const ProductionRouter: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Coming Soon</h1>
        <p className="text-xl">We're working on something exciting!</p>
      </div>
    </div>
  )
}

export default ProductionRouter