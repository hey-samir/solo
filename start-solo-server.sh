#!/bin/bash

# Start the Solo server using Node.js

echo "Starting Solo server on port 5000..."

# Create server file if it doesn't exist
if [ ! -f simple-server.js ]; then
  echo "Creating server file..."
  cat > simple-server.js << 'EOF'
/**
 * Simple Express Server for Solo App
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = 5000;
const STATIC_DIR = path.join(process.cwd(), 'dist/staging');

// Create app
const app = express();

// Basic request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Content type mapping
const CONTENT_TYPES = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.html': 'text/html',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Helper to set content type
function setContentType(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (CONTENT_TYPES[ext]) {
    res.setHeader('Content-Type', CONTENT_TYPES[ext]);
  }
}

// Serve assets with correct content types
app.use('/assets', (req, res, next) => {
  const filePath = path.join(STATIC_DIR, 'assets', req.path);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    setContentType(res, filePath);
    return res.sendFile(filePath);
  }
  next();
});

// Static file serving
app.use(express.static(STATIC_DIR, {
  index: 'staging.html',
  setHeaders: (res, filePath) => {
    setContentType(res, filePath);
  }
}));

// API mock for feature flags
app.get('/api/feature-flags', (req, res) => {
  res.json({
    enableFeedback: true,
    enableProfileEditing: true,
    enableSoloMode: true
  });
});

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(STATIC_DIR, 'staging.html'));
});

// Start the server
if (fs.existsSync(STATIC_DIR) && fs.existsSync(path.join(STATIC_DIR, 'staging.html'))) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Serving files from: ${STATIC_DIR}`);
  });
} else {
  console.error(`Error: Build not found at ${STATIC_DIR}`);
  process.exit(1);
}
EOF
fi

# Run the server
node simple-server.js