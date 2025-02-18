const express = require('express');
const router = express.Router();

// Feature flag configurations per environment
const featureFlags = {
  production: {
    enableAuth: true,
    enableStats: true,
    enablePro: false,         // Ensure Pro is disabled in production
    enableSessions: true,
    enableFeedback: false,    // Ensure Feedback is disabled in production
    enableSquads: true,
    enableSettings: true,
    enableStandings: true,
    showBottomNav: false,
    showFAQ: false,
    showEnvironmentBanner: true,  // Show banner in production
    environmentBannerText: 'Solo is sending soon. Follow @gosolonyc for updates'
  },
  staging: {
    enableAuth: true,
    enableStats: true,
    enablePro: true,          // Enable all features in staging
    enableSessions: true,
    enableFeedback: true,
    enableSquads: true,
    enableSettings: true,
    enableStandings: true,
    showBottomNav: true,
    showFAQ: true,
    showEnvironmentBanner: true,
    environmentBannerText: 'Staging Environment - Testing Features'
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

  // Set strict no-cache headers
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');

  // Use production flags for production environment, staging flags otherwise
  const flags = isProduction ? featureFlags.production : featureFlags.staging;

  console.log('[Feature Flags] Serving flags:', {
    isProduction,
    environment: isProduction ? 'production' : 'staging',
    flags: JSON.stringify(flags, null, 2)
  });

  res.json(flags);
});

module.exports = { router, featureFlags };