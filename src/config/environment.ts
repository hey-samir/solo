import { z } from 'zod'

// Feature flag schema
const FeatureFlagsSchema = z.object({
  enableAuth: z.boolean(),
  enableStats: z.boolean(),
  enablePro: z.boolean(),
  enableSessions: z.boolean(),
  enableFeedback: z.boolean(),
  enableSquads: z.boolean(),
  showBottomNav: z.boolean(),
  showFAQ: z.boolean(),
  showEnvironmentBanner: z.boolean(),
  environmentBannerText: z.string(),
})

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>

// Environment configuration
const envConfigs = {
  development: {
    apiUrl: 'http://localhost:3000/api',
  },
  staging: {
    apiUrl: 'http://localhost:5000/api',
  },
  production: {
    apiUrl: '/api',
  },
} as const

// Get current environment
const environment = import.meta.env.MODE || 'development'

// Export environment-specific config
export const config = {
  environment,
  ...envConfigs[environment as keyof typeof envConfigs],
}

// Initialize with strict production defaults
const productionDefaults: FeatureFlags = {
  enableAuth: true,
  enableStats: true,
  enablePro: true,
  enableSessions: true,
  enableFeedback: true,
  enableSquads: true,
  showBottomNav: false,
  showFAQ: false,
  showEnvironmentBanner: true,
  environmentBannerText: 'Solo is sending soon. Follow @gosolonyc for updates',
}

// State management
let currentFlags: FeatureFlags = { ...productionDefaults }
let isInitialized = false

// Feature flag service
export const FeatureFlagService = {
  isInitialized() {
    return isInitialized
  },

  async initialize() {
    try {
      const response = await fetch(`${config.apiUrl}/feature-flags`)
      if (!response.ok) throw new Error('Failed to fetch feature flags')
      const flags = await response.json()

      // Force production settings for specific flags in production
      if (environment === 'production') {
        flags.showBottomNav = false
        flags.showFAQ = false
        flags.showEnvironmentBanner = true
        flags.environmentBannerText = 'Solo is sending soon. Follow @gosolonyc for updates'
      }

      currentFlags = FeatureFlagsSchema.parse(flags)
      isInitialized = true

      console.log(`[FeatureFlags] Initialized for ${environment}:`, currentFlags)
    } catch (error) {
      console.error('Error initializing feature flags:', error)
      // Fallback to production defaults in case of error
      currentFlags = productionDefaults
      isInitialized = true
    }
  },

  getFlags(): FeatureFlags {
    if (!isInitialized) {
      console.warn('Feature flags accessed before initialization')
    }
    return currentFlags
  },
}

// Feature flag hook
export const useFeatureFlags = () => {
  return FeatureFlagService.getFlags()
}