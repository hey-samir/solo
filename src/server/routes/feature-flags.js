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
  },
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
    environmentBannerText: 'Staging Environment - Testing Features'
  }
};

// Initialize feature flags with proper error handling
router.get('/', (req, res) => {
  try {
    // Enhanced environment detection with port-based logic
    const port = parseInt(process.env.PORT || req.app.get('port'), 10);
    const forceProduction = process.env.FORCE_PRODUCTION === 'true';

    // Consider both 5000 and 5001 as staging ports, 3000 as production
    const isProduction = forceProduction || (!isNaN(port) && port === 3000);
    const isStaging = !isNaN(port) && (port === 5000 || port === 5001);

    console.log('[Feature Flags] Request received:', {
      port,
      NODE_ENV: process.env.NODE_ENV,
      forceProduction,
      isProduction,
      isStaging,
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

    // Use production flags for port 3000, staging flags for 5000/5001
    const flags = isProduction ? featureFlags.production : featureFlags.staging;

    // Add runtime information to response
    const flagsWithRuntime = {
      ...flags,
      _runtime: {
        environment: isProduction ? 'production' : 'staging',
        timestamp: new Date().toISOString(),
        port,
        isProduction,
        isStaging
      }
    };

    console.log('[Feature Flags] Serving flags:', {
      isProduction,
      isStaging,
      port,
      environment: flagsWithRuntime._runtime.environment
    });

    res.json(flagsWithRuntime);
  } catch (error) {
    console.error('[Feature Flags] Error serving flags:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve feature flags',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = { router, featureFlags };