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
  // Enhanced environment detection
  const forceProduction = process.env.FORCE_PRODUCTION === 'true';
  const isProduction = forceProduction || (
    process.env.NODE_ENV === 'production' && 
    parseInt(process.env.PORT || '3000', 10) === 3000
  );

  console.log('[Feature Flags] Request received:', {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    forceProduction,
    isProduction,
    requestPath: req.path,
    requestHost: req.get('host'),
    timestamp: new Date().toISOString()
  });

  // Set strict no-cache headers
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });

  // Use production flags for production environment, staging flags otherwise
  const flags = isProduction ? featureFlags.production : featureFlags.staging;

  // Add runtime information to flags
  const flagsWithRuntime = {
    ...flags,
    _runtime: {
      environment: isProduction ? 'production' : 'staging',
      timestamp: new Date().toISOString(),
      port: process.env.PORT,
      isProduction
    }
  };

  console.log('[Feature Flags] Serving flags:', {
    isProduction,
    environment: isProduction ? 'production' : 'staging',
    flags: JSON.stringify(flagsWithRuntime, null, 2)
  });

  res.json(flagsWithRuntime);
});

module.exports = { router, featureFlags };