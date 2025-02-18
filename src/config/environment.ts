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
})

export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>

// Environment configuration
export const config = {
  environment: import.meta.env.MODE || 'production',
  apiUrl: '/api',
}

// Production defaults (used as fallback)
export const productionDefaults: FeatureFlags = {
  enableAuth: true,
  enableStats: true,
  enablePro: false,
  enableSessions: true,
  enableFeedback: false,
  enableSquads: true,
  enableSettings: true,
  enableStandings: true,
  showBottomNav: false,
  showFAQ: false,
  showEnvironmentBanner: true,
  environmentBannerText: 'Solo is sending soon. Follow @gosolonyc for updates',
}

class FeatureFlagServiceClass {
  private flags: FeatureFlags | null = null;

  async initialize(): Promise<FeatureFlags> {
    try {
      const response = await fetch(`${config.apiUrl}/feature-flags`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.flags = FeatureFlagsSchema.parse(data);
      console.log('[FeatureFlags] Initialized with:', this.flags);
      return this.flags;
    } catch (error) {
      console.error('[FeatureFlags] Error:', error);
      this.flags = productionDefaults;
      return this.flags;
    }
  }

  getFlags(): FeatureFlags {
    if (!this.flags) {
      return productionDefaults;
    }
    return this.flags;
  }
}

export const FeatureFlagService = new FeatureFlagServiceClass();
export { FeatureFlagsSchema };