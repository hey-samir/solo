// Feature flag configuration
export interface FeatureFlags {
  enableFAQ: boolean;
  // Add other feature flags here as needed
}

// Default configuration for each environment
export const defaultFeatures: Record<string, FeatureFlags> = {
  development: {
    enableFAQ: true,
  },
  staging: {
    enableFAQ: true,
  },
  production: {
    enableFAQ: false,
  },
};

// Get environment-specific feature flags
export const getFeatureFlags = (environment: string): FeatureFlags => {
  return defaultFeatures[environment] || defaultFeatures.production;
};
