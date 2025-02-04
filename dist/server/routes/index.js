const express = require('express');
const router = express.Router();

// Basic route for initial testing
router.get('/test', (req, res) => {
  res.json({
    message: 'API is working',
    environment: process.env.NODE_ENV
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

module.exports = router;
