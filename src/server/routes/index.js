const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const userRoutes = require('./user');
const { router: featureFlagsRouter } = require('./feature-flags');
const leaderboardRoutes = require('./leaderboard');
const sessionsRoutes = require('./sessions');
const feedbackRoutes = require('./feedback');

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Basic route for testing
router.get('/test', (_req, res) => {
  res.json({
    message: 'API is working',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/feature-flags', featureFlagsRouter);
router.use('/leaderboard', leaderboardRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/feedback', feedbackRoutes);

module.exports = router;