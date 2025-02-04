const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = parseInt(process.env.PORT || (isProduction ? '80' : isStaging ? '5000' : '3000'), 10);

// Basic middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Add logging

// Import routes
try {
  const routes = require('./routes');
  app.use('/api', routes);
} catch (error) {
  console.error('Error loading routes:', error);
  process.exit(1);
}

// Health check endpoint (available in all environments)
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve static files in production/staging
if (isProduction || isStaging) {
  const staticPath = path.resolve(__dirname, '../../dist/client');

  console.log(`[${environment}] Configuring static files from: ${staticPath}`);
  console.log('Current directory:', process.cwd());
  console.log('__dirname:', __dirname);

  // Verify the static directory exists and contains files
  if (!fs.existsSync(staticPath)) {
    console.error(`Error: Static directory not found at ${staticPath}`);
    console.error('Build process may have failed or not been run');
    process.exit(1);
  }

  const files = fs.readdirSync(staticPath);
  console.log('Static directory verified successfully');
  console.log('Available files in static directory:', files);

  if (files.length === 0) {
    console.error('Error: Static directory is empty');
    console.error('Build process may have failed or not completed');
    process.exit(1);
  }

  // Serve static files with specific options
  app.use(express.static(staticPath, {
    etag: true,
    lastModified: true,
    maxAge: '1h'
  }));

  // Handle client-side routing - must come after static file serving
  app.get('*', (_req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      console.error('Error: index.html not found');
      return res.status(500).send('Error loading application - Build incomplete');
    }
    res.sendFile(indexPath);
  });
}

// Enhanced error handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString(),
    path: _req.path
  });
});

// Only start the server if this file is run directly
if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`Server started in ${environment} mode`);
    console.log(`Listening on http://0.0.0.0:${PORT}`);
    console.log(`Process ID: ${process.pid}`);
    console.log(`Node version: ${process.version}`);
    console.log(`Current directory: ${process.cwd()}`);
    console.log('='.repeat(50));
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

module.exports = app;