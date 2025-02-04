const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
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
if (isProduction || environment === 'staging') {
  console.log('Setting up static file serving for', environment);
  const staticPath = path.resolve(__dirname, '../../dist/client');
  console.log('Static path:', staticPath);

  // Serve static files
  app.use(express.static(staticPath));

  // Serve index.html for client-side routing
  app.get('*', (_req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    console.log('Serving index.html from:', indexPath);
    res.sendFile(indexPath);
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

// Start server
if (require.main === module) {
  // Ensure the client build exists in production/staging
  if (isProduction || environment === 'staging') {
    const indexPath = path.resolve(__dirname, '../../dist/client/index.html');
    if (!require('fs').existsSync(indexPath)) {
      console.error('Error: Client build not found at', indexPath);
      console.error('Please run the build process first');
      process.exit(1);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${environment} mode)`);
    console.log('Node.js version:', process.version);
    console.log('Current directory:', process.cwd());
  });
}

module.exports = app;