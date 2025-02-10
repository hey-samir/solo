import React from 'react'
import { Outlet } from 'react-router-dom'

const ProductionLayout: React.FC = () => {
  return (
    <main className="flex items-center justify-center h-screen">
      <Outlet />
    </main>
  )
}

export default ProductionLayout