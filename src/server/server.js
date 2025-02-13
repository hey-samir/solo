const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const apiRoutes = require('./routes');
const morgan = require('morgan');

const app = express();

// Basic configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const staticPath = path.join(process.cwd(), 'dist');

// Enable detailed logging
console.log('[Server] Starting with configuration:', {
  PORT,
  NODE_ENV,
  staticPath,
  staticExists: fs.existsSync(staticPath),
  files: fs.existsSync(staticPath) ? fs.readdirSync(staticPath) : []
});

// Enable error logging for uncaught exceptions immediately
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught exception:', error);
  process.exit(1);
});

// CORS and basic middleware setup
app.use(morgan('dev'));
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes first
console.log('[Server] Mounting API routes...');
app.use('/api', apiRoutes);

// Serve index.html for the root path
app.get('/', (req, res) => {
  const indexPath = path.join(staticPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('[Server] Error: index.html not found at', indexPath);
    return res.status(500).send('Server configuration error: index.html not found');
  }
  res.sendFile(indexPath);
});

// Serve static files
app.use(express.static(staticPath, {
  maxAge: NODE_ENV === 'production' ? '1h' : '0',
  etag: true
}));

// SPA support - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  const indexPath = path.join(staticPath, 'index.html');
  console.log('[Server] Serving SPA route:', {
    path: req.path,
    indexPath,
    exists: fs.existsSync(indexPath)
  });

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[Server] Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server] Error:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: NODE_ENV === 'development' ? err.stack : undefined
  });

  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`Server running in ${NODE_ENV} mode on http://0.0.0.0:${PORT}`);
    console.log(`Static files serving from: ${staticPath}`);
    console.log('='.repeat(50));
  });
}

module.exports = app;