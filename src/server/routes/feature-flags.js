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
    // Get environment from NODE_ENV instead of port
    const environment = process.env.NODE_ENV || 'production';

    // Log request details for debugging
    console.log('[Feature Flags] Environment detection:', {
      environment,
      nodeEnv: process.env.NODE_ENV,
      requestPath: req.path,
      requestHost: req.get('host'),
      timestamp: new Date().toISOString()
    });

    // Strict environment validation
    if (!['production', 'staging'].includes(environment)) {
      throw new Error(`Invalid environment: ${environment} is not configured for feature flags`);
    }

    // Set strict no-cache headers
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

    // Select appropriate flags based on environment
    const flags = featureFlags[environment];

    console.log('[Feature Flags] Serving flags:', {
      environment,
      flags: {
        enablePro: flags.enablePro,
        enableFeedback: flags.enableFeedback,
        showEnvironmentBanner: flags.showEnvironmentBanner,
        environmentBannerText: flags.environmentBannerText
      }
    });

    res.json(flags);
  } catch (error) {
    console.error('[Feature Flags] Error serving flags:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = { router, featureFlags };