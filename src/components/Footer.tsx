import React from 'react'
import { version } from '../config/version.json'

const Footer: React.FC = () => {
  return (
    <footer className="py-4 px-4 text-center text-sm text-gray-600">
      <p>
        <a 
          href="https://samir.xyz" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-solo-purple hover:text-solo-purple-dark"
        >
          Interspace Labs
        </a>
        {' '}2025
      </p>
      <p className="mt-2">
        Built at the speed of thought with{' '}
        <span role="img" aria-label="heart" className="text-white font-bold">♡</span> by{' '}
        <a 
          href="https://replit.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-solo-purple hover:text-solo-purple-dark"
        >
          Replit AI
        </a>
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Version {version}
      </p>
    </footer>
  )
}

export default Footer