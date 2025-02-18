const express = require('express');
const router = express.Router();

// Debug logging
console.log('[API Routes] Initializing basic router...');

// Health check endpoint
router.get('/health', (_req, res) => {
  console.log('[API Routes] Health check endpoint called');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Add request logging middleware
router.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Start with minimal routes
console.log('[API Routes] Setting up auth routes...');
const authRoutes = require('./auth');
router.use('/auth', authRoutes);

console.log('[API Routes] Setting up user routes...');
const userRoutes = require('./user');
router.use('/user', userRoutes);

console.log('[API Routes] Basic router setup complete');

module.exports = router;