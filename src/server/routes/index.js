const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const userRoutes = require('./user');
const { router: featureFlagsRouter } = require('./feature-flags');
const sessionsRoutes = require('./sessions');
const feedbackRoutes = require('./feedback');
const routesRoutes = require('./routes');
const statsRoutes = require('./stats');
const sendsRoutes = require('./sends');
const leaderboardRoutes = require('./leaderboard');

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
      user: '/api/user',
      features: '/api/feature-flags',
      sessions: '/api/sessions',
      feedback: '/api/feedback',
      routes: '/api/routes',
      stats: '/api/stats',
      sends: '/api/sends',
      leaderboard: '/api/leaderboard'
    }
  });
});

// Mount routes with debug logging
console.log('[API Routes] Mounting auth routes...');
router.use('/auth', authRoutes);

console.log('[API Routes] Mounting user routes...');
router.use('/user', userRoutes); 

console.log('[API Routes] Mounting feature flag routes...');
router.use('/feature-flags', featureFlagsRouter);

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

console.log('[API Routes] Mounting leaderboard routes...');
router.use('/leaderboard', leaderboardRoutes);

module.exports = router;