import { z } from 'zod'

// Feature flag schema
const FeatureFlagsSchema = z.object({
  enableAuth: z.boolean(),
  enableStats: z.boolean(),
  enablePro: z.boolean(),
  enableSessions: z.boolean(),
  enableFeedback: z.boolean(),
  enableSquads: z.boolean(),
  showComingSoon: z.boolean(),
})

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>

// Environment-specific configurations
const configs = {
  development: {
    apiUrl: 'http://localhost:3000/api',
    features: {
      enableAuth: true,
      enableStats: true,
      enablePro: true,
      enableSessions: true,
      enableFeedback: true,
      enableSquads: true,
      showComingSoon: false,
    },
  },
  staging: {
    apiUrl: 'http://localhost:5000/api',
    features: {
      enableAuth: true,
      enableStats: true,
      enablePro: true,
      enableSessions: true,
      enableFeedback: true,
      enableSquads: true,
      showComingSoon: false,
    },
  },
  production: {
    apiUrl: '/api',
    features: {
      enableAuth: false,
      enableStats: false,
      enablePro: false,
      enableSessions: false,
      enableFeedback: false,
      enableSquads: false,
      showComingSoon: true,
    },
  },
} as const

// Get current environment
const environment = import.meta.env.MODE || 'development'

// Export environment-specific config
export const config = {
  environment,
  ...configs[environment as keyof typeof configs],
}

// Feature flag hook
export const useFeatureFlags = () => {
  return config.features
}
