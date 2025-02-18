const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const apiRoutes = require('./routes');
const morgan = require('morgan');

const app = express();

// Environment-specific configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || (NODE_ENV === 'production' ? 3000 : 5000);
const staticPath = path.resolve(process.cwd(), 'dist');

console.log('[Server] Starting server with configuration:', {
  NODE_ENV,
  PORT,
  staticPath,
  DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not Set'
});

// Basic middleware setup
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Serve static files
app.use(express.static(staticPath));

// Check if dist directory exists
if (!fs.existsSync(staticPath)) {
  console.error(`[Server] Static path does not exist: ${staticPath}`);
  console.error('[Server] Current directory contents:', fs.readdirSync(process.cwd()));
} else {
  console.log('[Server] Static path exists:', staticPath);
}

// SPA support - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  const indexPath = path.join(staticPath, 'index.html');
  console.log('[Server] Attempting to serve:', indexPath);

  if (!fs.existsSync(indexPath)) {
    console.error('[Server] index.html not found at:', indexPath);
    return res.status(500).send('Application files not found. Please ensure the application is built properly.');
  }

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[Server] Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server] Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    path: req.path,
    message: err.message
  });
});

// Start server
if (require.main === module) {
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Server running in ${NODE_ENV} mode on http://0.0.0.0:${PORT}`);
    }).on('error', (err) => {
      console.error('[Server] Failed to start server:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('[Server] Critical error starting server:', err);
    process.exit(1);
  }
}

module.exports = app;