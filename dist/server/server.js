const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = process.env.PORT || (isProduction ? 80 : 3000);

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Add logging

// Import routes
const routes = require('./routes');

// API routes
app.use('/api', routes);

// Health check endpoint (available in all environments)
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production/staging
if (isProduction || isStaging) {
  const staticPath = path.resolve(__dirname, '../../dist/client');

  // Log the static file configuration
  console.log(`Serving static files for ${environment} environment`);
  console.log('Static path:', staticPath);

  // Verify the static directory exists
  const fs = require('fs');
  if (!fs.existsSync(staticPath)) {
    console.warn(`Warning: Static directory not found at ${staticPath}`);
    console.warn('Make sure to run the build process first');
  }

  // Serve static files
  app.use(express.static(staticPath));

  // Handle client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
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

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${environment}`);
    console.log('Node.js version:', process.version);
    console.log('Current directory:', process.cwd());
  });
}

module.exports = app;