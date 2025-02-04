const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Simple test route
app.get('/api/test', (_req, res) => {
  res.json({ 
    message: 'Server is working!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDir = path.join(__dirname, '../../dist/client');
  console.log('Serving static files from:', clientDir);

  app.use(express.static(clientDir));

  // Handle client-side routing
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

// Start server only if directly run
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (${process.env.NODE_ENV || 'development'} mode)`);
  });
}

module.exports = app;