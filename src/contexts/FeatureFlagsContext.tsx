import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
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
      console.log('[FeatureFlagsContext] Current environment:', import.meta.env.MODE)

      const newFlags = await FeatureFlagService.initialize()
      console.log('[FeatureFlagsContext] Flags loaded:', newFlags)

      if (newFlags._environment !== import.meta.env.MODE) {
        console.warn(
          `[FeatureFlagsContext] Environment mismatch! Client: ${import.meta.env.MODE}, Server: ${newFlags._environment}`
        )
      }

      setFlags(newFlags)
    } catch (err) {
      console.error('[FeatureFlagsContext] Error loading flags:', err)
      setError(err instanceof Error ? err.message : 'Failed to load application configuration')
      setFlags({
        ...productionDefaults,
        _environment: import.meta.env.MODE
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFlags()
    // Set up a periodic refresh every 5 minutes
    const interval = setInterval(loadFlags, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const value = useMemo(() => ({
    flags,
    isLoading,
    error,
    reload: loadFlags
  }), [flags, isLoading, error])

  return (
    <FeatureFlagsContext.Provider value={value}>
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