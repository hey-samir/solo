const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Configuration
const PORT = 5000;
const STATIC_DIR = path.join(process.cwd(), 'dist/staging');

// Verify static directory exists
if (!fs.existsSync(STATIC_DIR)) {
  console.error(`Error: Static directory not found: ${STATIC_DIR}`);
  process.exit(1);
}

console.log(`[Server] Static directory: ${STATIC_DIR}`);
console.log(`[Server] Available files:`, fs.readdirSync(STATIC_DIR));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve assets directory with specific content types
app.use('/assets', (req, res, next) => {
  console.log(`[Assets] Requested: ${req.path}`);
  
  const filePath = path.join(STATIC_DIR, 'assets', req.path);
  console.log(`[Assets] Looking for: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`[Assets] Found: ${filePath}`);
    
    // Set proper content type for CSS files
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      console.log('[Assets] Setting content type to text/css');
    }
    
    res.sendFile(filePath);
  } else {
    console.log(`[Assets] Not found: ${filePath}`);
    next();
  }
});

// Serve static files
app.use(express.static(STATIC_DIR, {
  index: 'staging.html',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// SPA fallback
app.get('*', (req, res) => {
  console.log(`[SPA] Fallback for: ${req.path}`);
  res.sendFile(path.join(STATIC_DIR, 'staging.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running at http://0.0.0.0:${PORT}`);
  console.log(`[Server] Serving static files from: ${STATIC_DIR}`);
});
