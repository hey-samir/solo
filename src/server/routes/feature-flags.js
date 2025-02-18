const express = require('express');
const router = express.Router();

// Feature flag configurations per environment
const featureFlags = {
  production: {
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
    environmentBannerText: 'Solo is sending soon. Follow @gosolonyc for updates'
  }
};

// Get feature flags based on environment
router.get('/', (req, res) => {
  console.log('[Feature Flags] Environment:', process.env.NODE_ENV);

  // Force strict production settings
  if (process.env.NODE_ENV === 'production') {
    // Set strict no-cache headers
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');

    console.log('[Feature Flags] Serving production flags:', 
      JSON.stringify(featureFlags.production, null, 2));

    return res.json(featureFlags.production);
  }

  // For non-production environments, still default to production
  res.json(featureFlags.production);
});

module.exports = { router, featureFlags };