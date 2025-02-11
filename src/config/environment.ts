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
export const config = {
  environment: import.meta.env.MODE || 'development',
  apiUrl: '/api',
}

// Production defaults (used as fallback)
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

class FeatureFlagServiceClass {
  private flags: FeatureFlags | null = null;

  async initialize(): Promise<FeatureFlags> {
    try {
      console.log(`[FeatureFlags] Initializing for ${config.environment} environment`)
      const response = await fetch(`${config.apiUrl}/feature-flags`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('[FeatureFlags] Received data:', data)

      // Validate the response data
      this.flags = FeatureFlagsSchema.parse(data)
      return this.flags
    } catch (error) {
      console.error('[FeatureFlags] Error fetching flags:', error)
      console.log('[FeatureFlags] Using production defaults')
      this.flags = productionDefaults
      return this.flags
    }
  }

  getFlags(): FeatureFlags {
    if (!this.flags) {
      console.warn('[FeatureFlags] Accessed before initialization, returning defaults')
      return productionDefaults
    }
    return this.flags
  }
}

// Create and export singleton instance
export const FeatureFlagService = new FeatureFlagServiceClass()

// Export schema
export { FeatureFlagsSchema }