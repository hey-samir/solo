const express = require('express');
const router = express.Router();

// Feature flag configurations per environment
const featureFlags = {
  production: {
    enableAuth: true,
    enableStats: true,
    enablePro: false,         // Ensure Pro is disabled
    enableSessions: true,
    enableFeedback: false,    // Ensure Feedback is disabled
    enableSquads: true,
    enableSettings: true,
    enableStandings: true,
    showBottomNav: false,
    showFAQ: false,
    showEnvironmentBanner: false,  // Ensure banner is hidden in production
    environmentBannerText: ''      // Clear banner text in production
  }
};

// Get feature flags based on environment
router.get('/', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.PORT === '3000';

  console.log('[Feature Flags] Request received:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    isProduction
  });

  // Set strict no-cache headers for all environments
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  const flags = featureFlags.production;

  console.log('[Feature Flags] Serving flags:', {
    isProduction,
    flags: JSON.stringify(flags, null, 2)
  });

  res.json(flags);
});

module.exports = { router, featureFlags };