import React, { createContext, useContext, useState, useEffect } from 'react'
import { FeatureFlags, FeatureFlagService, productionDefaults, config, FeatureFlagsSchema } from '../config/environment'

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

      const response = await fetch(`${config.apiUrl}/feature-flags`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('[FeatureFlagsContext] Received raw flags from server:', data)

      // Parse and validate the data using zod schema
      const parsedFlags = FeatureFlagsSchema.parse(data)

      // Force specific flags to be boolean and ensure they match production settings
      const newFlags: FeatureFlags = {
        ...parsedFlags,
        enablePro: Boolean(parsedFlags.enablePro),
        enableFeedback: Boolean(parsedFlags.enableFeedback),
        showEnvironmentBanner: Boolean(parsedFlags.showEnvironmentBanner),
      }

      console.log('[FeatureFlagsContext] Processed flags:', newFlags)
      setFlags(newFlags)
    } catch (err) {
      console.error('[FeatureFlagsContext] Error loading flags:', err)
      setFlags(productionDefaults)
      setError(err instanceof Error ? err.message : 'Failed to load feature flags')
    } finally {
      setIsLoading(false)
    }
  }

  // Load flags on mount
  useEffect(() => {
    loadFlags()
  }, [])

  // Debug log whenever flags change
  useEffect(() => {
    if (flags) {
      console.log('[FeatureFlagsContext] Current flags state:', {
        enablePro: flags.enablePro,
        enableFeedback: flags.enableFeedback,
        showEnvironmentBanner: flags.showEnvironmentBanner,
        environmentBannerText: flags.environmentBannerText
      })
    }
  }, [flags])

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