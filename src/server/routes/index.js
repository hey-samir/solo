const express = require('express');
const router = express.Router();

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

// Mount other route modules here as they're converted to JS
// Example: router.use('/auth', require('./auth'));

module.exports = router;