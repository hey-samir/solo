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

router.get('/', (req, res) => {
  const environment = process.env.NODE_ENV || 'development';
  console.log(`[Feature Flags] Current NODE_ENV: ${environment}`);

  // Force staging flags for any non-production environment
  const configEnvironment = environment === 'production' ? 'production' : 'staging';
  console.log(`[Feature Flags] Using config for environment: ${configEnvironment}`);

  const config = featureFlags[configEnvironment];
  console.log(`[Feature Flags] Serving configuration for ${configEnvironment}:`, JSON.stringify(config, null, 2));

  // Add cache control headers
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  res.set('Vary', '*');

  res.json(config);
});

module.exports = router;