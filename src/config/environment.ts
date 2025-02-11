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

// Production defaults
export const productionDefaults: FeatureFlags = {
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

      // Force production settings in production environment
      if (config.environment === 'production') {
        this.flags.showBottomNav = false
        this.flags.showFAQ = false
      }

      console.log('[FeatureFlags] Successfully initialized:', this.flags)
      return this.flags
    } catch (error) {
      console.error('[FeatureFlags] Error fetching flags:', error)
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

// Export a singleton instance
export const FeatureFlagService = new FeatureFlagServiceClass()

export { FeatureFlagsSchema, productionDefaults }