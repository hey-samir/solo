const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const apiRoutes = require('./routes');
const morgan = require('morgan');

const app = express();

// Enable error logging for uncaught exceptions immediately
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error);
  process.exit(1);
});

// Basic configuration with enhanced environment detection
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 5000);
const NODE_ENV = process.env.NODE_ENV || 'development';
const staticPath = path.resolve(__dirname, '../../dist');

console.log('[Server] Starting with configuration:', {
  NODE_ENV,
  PORT,
  staticPath,
  timestamp: new Date().toISOString()
});

// Verify static directory exists
if (!fs.existsSync(staticPath)) {
  console.error(`[Server] Error: Static directory not found at ${staticPath}`);
  process.exit(1);
}

// Extended logging middleware
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log(`[${NODE_ENV}] ${req.method} ${req.url}`);
  next();
});

// CORS configuration for API routes only
const apiCorsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://0.0.0.0:3000',
      'http://0.0.0.0:5000',
      ...(process.env.REPL_SLUG ? [
        `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      ] : [])
    ];

    if (!origin || allowedOrigins.includes(origin) || origin?.includes('repl.co') || origin?.includes('replit.dev')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
});

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with proper configuration
app.use(express.static(staticPath, {
  maxAge: NODE_ENV === 'production' ? '1h' : '0',
  etag: true,
  index: false // Don't auto-serve index.html
}));

// Apply CORS only to API routes
app.use('/api', apiCorsMiddleware, apiRoutes);

// Health check endpoint with enhanced environment info
app.get('/health', (_req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  const healthy = fs.existsSync(indexPath);

  const healthStatus = { 
    status: healthy ? 'ok' : 'error',
    environment: NODE_ENV,
    port: PORT,
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
    server_time: new Date().toISOString(),
    is_production: NODE_ENV === 'production' || PORT === 3000
  });
});

// SPA support - serve index.html for all non-asset routes
app.get('*', (req, res, next) => {
  // Skip API routes and files with extensions
  if (req.path.startsWith('/api/') || path.extname(req.path)) {
    return next();
  }

  const indexPath = path.join(staticPath, 'index.html');
  console.log(`[${NODE_ENV}] Serving index.html from:`, indexPath);

  // Verify index.html exists
  if (!fs.existsSync(indexPath)) {
    console.error(`[${NODE_ENV}] Error: index.html not found at ${indexPath}`);
    return res.status(500).send(`Error: Unable to serve index.html in ${NODE_ENV} environment`);
  }

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error(`[${NODE_ENV}] Error sending index.html:`, err);
      next(err);
    } else {
      console.log(`[${NODE_ENV}] Successfully served index.html`);
    }
  });
});

// Global error handler with detailed logging
app.use((err, req, res, next) => {
  console.error('[Server Error]:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: NODE_ENV !== 'production' ? err.stack : undefined,
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
  const server = app.listen(PORT, '0.0.0.0')
    .on('error', (error) => {
      console.error('[Server] Failed to start:', error);
      process.exit(1);
    })
    .on('listening', () => {
      console.log('='.repeat(50));
      console.log(`[Server] Running in ${NODE_ENV} mode on http://0.0.0.0:${PORT}`);
      console.log(`[Server] Static files serving from: ${staticPath}`);
      console.log('='.repeat(50));
    });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] Closed remaining connections.');
      process.exit(0);
    });
  });
}

module.exports = app;