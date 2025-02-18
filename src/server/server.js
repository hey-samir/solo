const express = require('express');
const cors = require('cors');
const { router: featureFlagsRouter } = require('./routes/feature-flags');
const app = express();

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple CORS setup
app.use(cors());

// Mount feature flags router at the correct path
app.use('/api/feature-flags', featureFlagsRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      featureFlags: '/api/feature-flags'
    }
  });
});

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error('[Server Error]:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ 
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  const PORT = parseInt(process.env.PORT || '3002', 10);

  app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`[Server] Successfully started on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50));
  }).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const fallbackPort = PORT + 1;
      console.log(`[Server] Port ${PORT} is in use, trying fallback port ${fallbackPort}`);
      app.listen(fallbackPort, '0.0.0.0', () => {
        console.log('='.repeat(50));
        console.log(`[Server] Successfully started on fallback port ${fallbackPort}`);
        console.log('='.repeat(50));
      });
    } else {
      console.error('[Server] Failed to start:', error);
      process.exit(1);
    }
  });
}

module.exports = app;