import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Navbar(): React.ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  
  const isActive = (path: string) => router.pathname === path

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/favicon.png"
                alt="Solo Logo"
              />
              <span className="ml-2 text-xl font-bold text-primary-dark">Solo</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link 
              href="/sends" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/sends') 
                  ? 'text-white bg-primary-dark' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
            >
              Sends
            </Link>
            <Link 
              href="/sessions" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/sessions') 
                  ? 'text-white bg-primary-dark' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
            >
              Sessions
            </Link>
            <Link 
              href="/stats" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/stats') 
                  ? 'text-white bg-primary-dark' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
            >
              Stats
            </Link>
            <Link 
              href="/profile" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/profile') 
                  ? 'text-white bg-primary-dark' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
            >
              Profile
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu open/close icon */}
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/sends" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/sends') 
                  ? 'text-white bg-primary-dark' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Sends
            </Link>
            <Link 
              href="/sessions" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/sessions') 
                  ? 'text-white bg-primary-dark' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Sessions
            </Link>
            <Link 
              href="/stats" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/stats') 
                  ? 'text-white bg-primary-dark' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Stats
            </Link>
            <Link 
              href="/profile" 
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/profile') 
                  ? 'text-white bg-primary-dark' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}