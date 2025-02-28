import React, { ReactNode } from 'react'
import Head from 'next/head'
import Navbar from './Navbar'
import Footer from './Footer'

type LayoutProps = {
  children: ReactNode
  title?: string
  description?: string
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Solo - Climbing Performance Tracker',
  description = 'Track your climbing journey with intuitive technology'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          {children}
        </main>
        
        <Footer />
      </div>
    </>
  )
}

export default Layout