const express = require('express');
const router = express.Router();

// Feature flag configurations per environment
const featureFlags = {
  staging: {
    enableAuth: true,
    enableStats: true,
    enablePro: true,
    enableSessions: true,
    enableFeedback: true,
    enableSquads: true,
    enableSettings: true,
    enableStandings: true,
    showBottomNav: true,
    showFAQ: true,
    showEnvironmentBanner: true,
    environmentBannerText: 'Staging Environment - Testing',
  },
  production: {
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
  },
};

// Get feature flags based on environment
router.get('/', (req, res) => {
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'staging';
  console.log(`[Feature Flags] Request received for ${environment} environment`);

  // Add cache control headers to prevent stale configurations
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  const config = featureFlags[environment];
  console.log(`[Feature Flags] Serving configuration:`, JSON.stringify(config, null, 2));

  res.json(config);
});

module.exports = {
  router,
  featureFlags,
};