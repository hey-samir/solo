import React, { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import ErrorBoundary from './components/ErrorBoundary'
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext'
import Router from './Router'
import LoadingSpinner from './components/LoadingSpinner'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'

if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Any additional initialization can go here
        setIsLoading(false)
      } catch (error) {
        console.error('[App] Failed to initialize:', error)
        setInitError('Failed to initialize application')
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <LoadingSpinner />
      </div>
    )
  }

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">{initError}</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-solo-purple text-white rounded-lg hover:bg-solo-purple-light transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      appearance={{
        baseTheme: dark,
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
          logoPlacement: "none",
        },
        elements: {
          formButtonPrimary: "bg-solo-purple hover:bg-solo-purple-light",
          card: "bg-bg-secondary shadow-xl rounded-xl",
          socialButtons: {
            displayConfig: {
              google: true,
              apple: true,
              github: true,
            }
          },
          headerTitle: "text-2xl font-bold text-text-primary",
          headerSubtitle: "text-sm text-text-secondary",
          rootBox: "w-full max-w-md mx-auto",
          socialButtonsIconButton: {
            height: "44px",
            width: "44px"
          }
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <FeatureFlagsProvider>
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
          </FeatureFlagsProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  )
}

export default App