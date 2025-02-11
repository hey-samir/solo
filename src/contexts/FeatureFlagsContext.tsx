import React, { createContext, useContext, useState, useEffect } from 'react'
import { FeatureFlags, FeatureFlagService, config } from '../config/environment'

interface FeatureFlagsContextType {
  flags: FeatureFlags | null
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType>({
  flags: null,
  isLoading: true,
  error: null,
  reload: async () => {}
})

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFlags = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`${config.apiUrl}/feature-flags`)
      if (!response.ok) throw new Error('Failed to fetch feature flags')
      
      const data = await response.json()
      console.log('Fetched feature flags:', data)
      
      setFlags(data)
    } catch (err) {
      console.error('Error loading feature flags:', err)
      setError('Failed to load application configuration')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFlags()
  }, [])

  return (
    <FeatureFlagsContext.Provider value={{ flags, isLoading, error, reload: loadFlags }}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext)
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider')
  }
  return context
}
