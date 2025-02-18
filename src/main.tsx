import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

// Enhanced debug logging
console.log('[Main] React app initializing...')
console.log('[Main] Environment:', import.meta.env.MODE)
console.log('[Main] API URL:', import.meta.env.VITE_API_URL)
console.log('[Main] Base URL:', window.location.origin)

const root = document.getElementById('root')
if (!root) {
  console.error('[Main] Root element not found')
  throw new Error('Root element not found')
}

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
  console.log('[Main] React app mounted successfully')
} catch (error) {
  console.error('[Main] Error mounting React app:', error)
}