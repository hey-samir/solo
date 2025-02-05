import React from 'react'
import { Outlet } from 'react-router-dom'

const ProductionLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <main className="flex items-center justify-center h-screen">
        <Outlet />
      </main>
    </div>
  )
}

export default ProductionLayout