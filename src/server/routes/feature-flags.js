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
    showBottomNav: false, // Explicitly disabled for production
    showFAQ: false, // Explicitly disabled for production
    showEnvironmentBanner: true,
    environmentBannerText: 'Solo is sending soon. Follow @gosolonyc for updates',
  },
};

// Get feature flags based on environment
router.get('/', (req, res) => {
  const environment = process.env.NODE_ENV || 'development';
  console.log(`[Feature Flags] Serving flags for ${environment} environment`);
  console.log(`[Feature Flags] Flags:`, JSON.stringify(featureFlags[environment], null, 2));
  res.json(featureFlags[environment]);
});

module.exports = router;