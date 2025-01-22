import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('Environment:', process.env.NODE_ENV)
console.log('API URL:', process.env.VITE_API_URL)
console.log('Starting React application...')

const root = document.getElementById('root')
if (!root) {
  console.error('Root element not found!')
} else {
  console.log('Root element found, mounting React...')
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    console.log('React mounted successfully')
  } catch (error) {
    console.error('Failed to mount React:', error)
  }
}