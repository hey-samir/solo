import React from 'react'
import { Outlet } from 'react-router-dom'

const ProductionLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <main className="flex-grow flex items-center justify-center">
        <Outlet />
      </main>
    </div>
  )
}

export default ProductionLayout
