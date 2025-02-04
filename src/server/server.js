const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const isStaging = environment === 'staging';
const PORT = parseInt(process.env.PORT || (isProduction ? '80' : '3000'), 10);

// Basic middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Import routes
try {
  const routes = require('./routes');
  app.use('/api', routes);
} catch (error) {
  console.error('Error loading routes:', error);
  process.exit(1);
}

// Health check endpoint
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
  const staticPath = path.resolve(__dirname, '../../client');
  console.log(`[${environment}] Serving static files from: ${staticPath}`);

  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(staticPath, 'index.html'));
    });
  } else {
    console.warn(`Static directory not found: ${staticPath}`);
  }
}

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`Server started in ${environment} mode`);
    console.log(`Listening on http://0.0.0.0:${PORT}`);
    console.log(`Process ID: ${process.pid}`);
    console.log('='.repeat(50));
  });
}

module.exports = app;