import { z } from 'zod'

// Feature flag schema
const FeatureFlagsSchema = z.object({
  enableAuth: z.boolean(),
  enableStats: z.boolean(),
  enablePro: z.boolean(),
  enableSessions: z.boolean(),
  enableFeedback: z.boolean(),
  enableSquads: z.boolean(),
  enableSettings: z.boolean(),
  enableStandings: z.boolean(),
  showBottomNav: z.boolean(),
  showFAQ: z.boolean(),
  showEnvironmentBanner: z.boolean(),
  environmentBannerText: z.string(),
  _environment: z.string(), // Add environment tracking
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
  enableSettings: false,
  enableStandings: false,
  showBottomNav: false,
  showFAQ: false,
  showEnvironmentBanner: true,
  environmentBannerText: 'Solo is sending soon. Follow @gosolonyc for updates',
  _environment: 'production',
}

class FeatureFlagServiceClass {
  private flags: FeatureFlags | null = null;

  async initialize(): Promise<FeatureFlags> {
    try {
      const environment = import.meta.env.MODE || 'development'
      console.log(`[FeatureFlags] Initializing for ${environment} environment`)

      const timestamp = new Date().getTime()
      const response = await fetch(`${config.apiUrl}/feature-flags?_t=${timestamp}&env=${environment}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('[FeatureFlags] Received raw data:', JSON.stringify(data, null, 2))

      // Validate the response data
      this.flags = FeatureFlagsSchema.parse({
        ...data,
        _environment: data._environment || environment
      })

      console.log('[FeatureFlags] Parsed and validated flags:', JSON.stringify(this.flags, null, 2))
      return this.flags
    } catch (error) {
      console.error('[FeatureFlags] Error fetching flags:', error)
      console.log('[FeatureFlags] Using production defaults')
      this.flags = {
        ...productionDefaults,
        _environment: 'production (fallback)'
      }
      return this.flags
    }
  }

  getFlags(): FeatureFlags {
    if (!this.flags) {
      console.warn('[FeatureFlags] Accessed before initialization, returning defaults')
      return productionDefaults
    }

    console.log('[FeatureFlags] Serving flags for environment:', this.flags._environment)
    console.log('[FeatureFlags] Current flags state:', JSON.stringify(this.flags, null, 2))
    return this.flags
  }
}

// Create and export singleton instance
export const FeatureFlagService = new FeatureFlagServiceClass()

// Export schema and types
export { FeatureFlagsSchema }