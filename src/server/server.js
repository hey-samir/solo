const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const environment = process.env.NODE_ENV || 'development';
const isProduction = environment === 'production';
const PORT = process.env.PORT || (isProduction ? 80 : 3000);

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy',
    environment,
    timestamp: new Date().toISOString()
  });
});

// Basic route
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'operational',
    environment,
    serverTime: new Date().toISOString()
  });
});

// Serve static files in production
if (isProduction) {
  const clientDir = path.join(process.cwd(), 'dist', 'client');
  app.use(express.static(clientDir));

  // Handle client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

// Error handler (from original, adapted)
app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: isProduction ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server (from original, adapted)
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${environment} mode)`);
  });
}

module.exports = app;