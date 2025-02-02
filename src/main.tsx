import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

// Add debug logging
console.log('React app initializing...')
console.log('Environment:', import.meta.env.MODE)
console.log('API URL:', import.meta.env.VITE_API_URL)
console.log('Base URL:', window.location.origin)

const root = document.getElementById('root')
if (!root) {
  console.error('Root element not found')
  throw new Error('Root element not found')
}

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('React app mounted successfully')
} catch (error) {
  console.error('Error mounting React app:', error)
}