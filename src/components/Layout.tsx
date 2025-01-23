import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Header from './Header'

export default function Layout(): React.ReactElement {
  return (
    <>
      <Header />
      <main className="container">
        <Outlet />
      </main>
      <Navbar />
    </>
  )
}