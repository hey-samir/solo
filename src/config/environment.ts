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

// Default feature flags - will be overridden by API
const defaultFlags: FeatureFlags = {
  enableAuth: false,
  enableStats: false,
  enablePro: false,
  enableSessions: false,
  enableFeedback: false,
  enableSquads: false,
  showBottomNav: false,
  showFAQ: false,
  showEnvironmentBanner: true,
  environmentBannerText: '',
}

let currentFlags = { ...defaultFlags }

// Feature flag service
export const FeatureFlagService = {
  async initialize() {
    try {
      const response = await fetch(`${config.apiUrl}/feature-flags`)
      if (!response.ok) throw new Error('Failed to fetch feature flags')
      const flags = await response.json()
      currentFlags = FeatureFlagsSchema.parse(flags)
    } catch (error) {
      console.error('Error fetching feature flags:', error)
      // Fallback to environment-specific defaults
      if (environment === 'staging') {
        currentFlags = {
          ...defaultFlags,
          enableAuth: true,
          enableStats: true,
          enablePro: true,
          enableSessions: true,
          enableFeedback: true,
          enableSquads: true,
          showBottomNav: true,
          showFAQ: true,
          showEnvironmentBanner: true,
          environmentBannerText: 'Staging environment',
        }
      } else if (environment === 'production') {
        currentFlags = {
          ...defaultFlags,
          // Production specific flags as requested
          showBottomNav: false, // Bottom nav off
          showFAQ: false, // FAQ off
          showEnvironmentBanner: true, // Banner on
          environmentBannerText: 'Solo is sending soon. Follow @gosolonyc for updates',
        }
      }
    }
  },
  getFlags() {
    return currentFlags
  },
}

// Feature flag hook
export const useFeatureFlags = () => {
  return FeatureFlagService.getFlags()
}