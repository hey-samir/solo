const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const apiRoutes = require('./routes');
const morgan = require('morgan');

const app = express();

// Enable error logging for uncaught exceptions immediately
process.on('uncaughtException', (error) => {
  console.error('Early uncaught exception:', error);
  process.exit(1);
});

// Basic configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const staticPath = path.join(process.cwd(), '/dist');

// Extended logging middleware
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log(`[${NODE_ENV}] ${req.method} ${req.url} with query:`, req.query);
  next();
});

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
app.use(express.urlencoded({ extended: true }));

// Mount all API routes under /api
console.log('[Server] Mounting API routes...');
app.use('/api', apiRoutes);

// Serve static files with proper MIME types and caching
app.use(express.static(staticPath, {
  maxAge: NODE_ENV === 'production' ? '1h' : '0',
  etag: true
}));

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
      staticPath,
      buildExists: fs.existsSync(staticPath)
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

// SPA support - serve index.html for all non-asset routes
app.get('*', (req, res, next) => {
  // Skip for API and asset requests
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    return next();
  }

  const indexPath = path.join(staticPath, 'index.html');

  if (!fs.existsSync(indexPath)) {
    console.error(`[${NODE_ENV}] Error: index.html not found at ${indexPath}`);
    return res.status(500).send(`Error: Unable to serve index.html in ${NODE_ENV} environment`);
  }

  res.sendFile(indexPath);
});

// Global error handler with detailed logging
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({ 
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Start server if not being required as a module
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`Server running in ${NODE_ENV} mode on http://0.0.0.0:${PORT}`);
    console.log(`Static files serving from: ${staticPath}`);
    console.log('='.repeat(50));
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