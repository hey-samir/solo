const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString()
  });
});

// Simple test route
app.get('/api/test', (_req, res) => {
  res.json({ 
    message: 'Server is working!',
    environment
  });
});

// Serve static files in production or staging
if (isProduction || isStaging) {
  const clientDir = path.join(__dirname, '../../dist/client');
  console.log('Serving static files from:', clientDir);

  // Verify the static directory exists
  const fs = require('fs');
  if (!fs.existsSync(clientDir)) {
    console.warn(`Warning: Static directory not found at ${clientDir}`);
    console.warn('Make sure to run the build process first');
  }

  app.use(express.static(clientDir));

  // Handle client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;