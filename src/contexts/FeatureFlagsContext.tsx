import React, { createContext, useContext, useState, useEffect } from 'react'
import { FeatureFlags, FeatureFlagService, productionDefaults } from '../config/environment'

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
  reload: async () => {},
})

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFlags = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('[FeatureFlagsContext] Loading flags...')
      const newFlags = await FeatureFlagService.initialize()
      console.log('[FeatureFlagsContext] Flags loaded:', newFlags)
      setFlags(newFlags)
    } catch (err) {
      console.error('[FeatureFlagsContext] Error loading flags:', err)
      setError(err instanceof Error ? err.message : 'Failed to load application configuration')
      setFlags(productionDefaults) // Fallback to defaults on error
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