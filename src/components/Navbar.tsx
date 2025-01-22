import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar(): React.ReactElement {
  return (
    <nav className="bg-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Solo
          </Link>
          <div className="flex space-x-4">
            <Link to="/profile" className="hover:text-purple-200">Profile</Link>
            <Link to="/sends" className="hover:text-purple-200">Sends</Link>
            <Link to="/sessions" className="hover:text-purple-200">Sessions</Link>
            <Link to="/stats" className="hover:text-purple-200">Stats</Link>
            <Link to="/standings" className="hover:text-purple-200">Standings</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
