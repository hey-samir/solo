const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const apiRoutes = require('./routes');
const featureFlags = require('./routes/feature-flags');
const authRoutes = require('./routes/auth');

const app = express();

// Enable error logging for uncaught exceptions immediately
process.on('uncaughtException', (error) => {
  console.error('Early uncaught exception:', error);
  process.exit(1);
});

// Basic configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const staticPath = path.resolve(__dirname, '../../dist');

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://0.0.0.0:3000',
      'http://0.0.0.0:5000'
    ];
    callback(null, allowedOrigins.includes(origin));
  },
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes); // Mount auth routes under /api/auth explicitly

// Add environment-specific middleware - simplified logging
app.use((req, res, next) => {
  if (req.path !== '/health' && !req.path.startsWith('/assets/')) {
    console.log(`[${NODE_ENV}] ${req.method} ${req.path}`);
  }
  res.set('X-Environment', NODE_ENV);
  next();
});

// Serve static files
app.use(express.static(staticPath));

// Health check endpoint
app.get('/health', (_req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  const healthy = fs.existsSync(indexPath);

  const healthStatus = { 
    status: healthy ? 'ok' : 'error',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    details: {
      indexFile: healthy ? 'present' : 'missing',
      staticPath
    }
  };

  console.log('[Health Check]', JSON.stringify(healthStatus, null, 2));
  res.status(healthy ? 200 : 503).json(healthStatus);
});

// Environment endpoint
app.get('/api/environment', (_req, res) => {
  res.json({ 
    environment: NODE_ENV,
    server_time: new Date().toISOString()
  });
});

// SPA support - serve index.html for all routes
app.get('*', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error(`Error: index.html not found at ${indexPath}`);
    return res.status(500).send(`Error: Unable to serve index.html in ${NODE_ENV} environment`);
  }

  res.sendFile(indexPath);
});

// Start server if not being required as a module
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${NODE_ENV} mode on http://0.0.0.0:${PORT}`);
  }).on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

module.exports = app;