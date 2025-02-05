import React from 'react'
import ComingSoon from './pages/ComingSoon'

const ProductionRouter: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <main className="flex items-center justify-center h-screen">
        <ComingSoon />
      </main>
    </div>
  )
}

export default ProductionRouter