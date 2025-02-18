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
export const productionDefaults: FeatureFlags = {
  enableAuth: true,
  enableStats: false,
  enablePro: false,
  enableSessions: false,
  enableFeedback: false,
  enableSquads: false,
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
      // Add timestamp to URL to prevent caching
      const timestamp = new Date().getTime()
      const response = await fetch(`${config.apiUrl}/feature-flags?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

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

// Export schema and types
export { FeatureFlagsSchema }