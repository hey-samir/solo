const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const userRoutes = require('./user');
const { router: featureFlagsRouter } = require('./feature-flags');
const leaderboardRoutes = require('./auth'); // We use auth for leaderboard
const sessionsRoutes = require('./sessions');
const feedbackRoutes = require('./feedback');
const routesRoutes = require('./routes');
const statsRoutes = require('./stats');
const sendsRoutes = require('./sends');

// Debug logging
console.log('[API Routes] Initializing routes...');

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    routes: {
      auth: '/api/auth',
      users: '/api/users',
      features: '/api/feature-flags',
      leaderboard: '/api/leaderboard',
      sessions: '/api/sessions',
      feedback: '/api/feedback',
      routes: '/api/routes',
      stats: '/api/stats',
      sends: '/api/sends'
    }
  });
});

// Mount routes with debug logging
console.log('[API Routes] Mounting auth routes...');
router.use('/auth', authRoutes);

console.log('[API Routes] Mounting user routes...');
router.use('/users', userRoutes);

console.log('[API Routes] Mounting feature flag routes...');
router.use('/feature-flags', featureFlagsRouter);

console.log('[API Routes] Mounting leaderboard routes...');
router.use('/leaderboard', leaderboardRoutes);

console.log('[API Routes] Mounting session routes...');
router.use('/sessions', sessionsRoutes);

console.log('[API Routes] Mounting feedback routes...');
router.use('/feedback', feedbackRoutes);

console.log('[API Routes] Mounting climbing routes...');
router.use('/routes', routesRoutes);

console.log('[API Routes] Mounting stats routes...');
router.use('/stats', statsRoutes);

console.log('[API Routes] Mounting sends routes...');
router.use('/sends', sendsRoutes);

module.exports = router;