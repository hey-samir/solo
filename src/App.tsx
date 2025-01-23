import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Router from './Router'

console.log('App component mounting...')
console.log('Environment:', process.env.NODE_ENV)
console.log('API URL:', process.env.VITE_API_URL)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Add global error handler for uncaught errors
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

function App(): React.ReactElement {
  console.log('App component rendering...')
  return (
    <div className="app-container">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  )
}

export default App