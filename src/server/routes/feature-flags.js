const express = require('express');
const router = express.Router();

// Feature flag configurations per environment
const featureFlags = {
  staging: {
    enableAuth: true,
    enableStats: true,
    enablePro: false,
    enableSessions: true,
    enableFeedback: true,
    enableSquads: false,
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
    showBottomNav: false,
    showFAQ: false,
    showEnvironmentBanner: true,
    environmentBannerText: 'Solo is sending soon. Follow @gosolonyc for updates',
  },
};

// Get feature flags based on environment
router.get('/', (req, res) => {
  const environment = process.env.NODE_ENV === 'production' ? 'production' : 'staging';

  if (!router.flagsInitialized) {
    console.log(`[Feature Flags] Initialized for ${environment} environment:`, 
      JSON.stringify(featureFlags[environment], null, 2));
    router.flagsInitialized = true;
  }

  res.json(featureFlags[environment]);
});

module.exports = {
  router,
  featureFlags,
};