const express = require('express');
const router = express.Router();

// Feature flag configurations per environment
const featureFlags = {
  development: {
    enableAuth: true,
    enableStats: true,
    enablePro: true,
    enableSessions: true,
    enableFeedback: true,
    enableSquads: true,
    showBottomNav: true,
    showFAQ: true,
    showEnvironmentBanner: true,
    environmentBannerText: 'Development Environment',
  },
  staging: {
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
  },
  production: {
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
  },
};

// Get feature flags based on environment
router.get('/', (req, res) => {
  const environment = process.env.NODE_ENV || 'development';
  // Only log on initial server start
  if (!router.flagsInitialized) {
    console.log(`[Feature Flags] Initialized for ${environment} environment:`, 
      JSON.stringify(featureFlags[environment], null, 2));
    router.flagsInitialized = true;
  }
  res.json(featureFlags[environment]);
});

module.exports = router;