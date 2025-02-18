import React, { createContext, useContext, useState, useEffect } from 'react'
import { FeatureFlags, FeatureFlagService, productionDefaults } from '../config/environment'
import config from '../config'; // Assuming config.apiUrl exists here
import * as yup from 'yup';
const FeatureFlagsSchema = yup.object({
    enablePro: yup.boolean().required(),
    enableFeedback: yup.boolean().required(),
    bannerText: yup.string().required()
}).required();


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

      // Force cache bypass
      const response = await fetch(`${config.apiUrl}/feature-flags`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('[FeatureFlagsContext] Received flags:', data)

      // Validate and set the flags
      const newFlags = FeatureFlagsSchema.parse(data)
      console.log('[FeatureFlagsContext] Parsed flags:', newFlags)
      setFlags(newFlags)
    } catch (err) {
      console.error('[FeatureFlagsContext] Error loading flags:', err)
      setError(err instanceof Error ? err.message : 'Failed to load application configuration')
      setFlags(productionDefaults)
    } finally {
      setIsLoading(false)
    }
  }

  // Load flags on mount and environment change
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