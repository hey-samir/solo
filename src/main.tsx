import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// Add debug logging
console.log('React app initializing...')
console.log('Environment:', process.env.NODE_ENV)
console.log('API URL:', process.env.VITE_API_URL)
console.log('Base URL:', window.location.origin)

const root = document.getElementById('root')
if (!root) {
  console.error('Root element not found')
  throw new Error('Root element not found')
}

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

console.log('Root element found, mounting React app...')

try {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  )
  console.log('React app mounted successfully')
} catch (error) {
  console.error('Error mounting React app:', error)
}