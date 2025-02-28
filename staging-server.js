/**
 * Staging Server for Solo Application
 * 
 * This server provides:
 * 1. Static file serving for the staging build
 * 2. SPA fallback for client-side routing
 * 3. Proper MIME type handling
 * 4. Graceful error handling and logging
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const STATIC_DIR = path.join(process.cwd(), 'dist/staging');
const LOG_FILE = path.join(process.cwd(), 'staging-server.log');

// Set up logging to both console and file
const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logMessage);
  console.log(message);
};

// Verify static directory exists
if (!fs.existsSync(STATIC_DIR)) {
  logToFile(`Error: Static directory not found: ${STATIC_DIR}`);
  logToFile('Please run the build:staging script first');
  process.exit(1);
}

// Log server startup
logToFile(`Staging Server Starting - ${new Date().toISOString()}`);
logToFile(`Environment: ${process.env.NODE_ENV || 'development'}`);
logToFile(`Static directory: ${STATIC_DIR}`);
logToFile(`Available files: ${fs.readdirSync(STATIC_DIR).join(', ')}`);

// Logging middleware
app.use((req, res, next) => {
  logToFile(`${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  const errMsg = `Error processing ${req.method} ${req.url}: ${err.message}`;
  logToFile(errMsg);
  console.error(err.stack);
  res.status(500).send('Server Error');
});

// Serve assets directory with specific content types
app.use('/assets', (req, res, next) => {
  const filePath = path.join(STATIC_DIR, 'assets', req.path);
  
  if (fs.existsSync(filePath)) {
    logToFile(`Asset found: ${filePath}`);
    
    // Set proper content types based on extension
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
    
    res.sendFile(filePath);
  } else {
    logToFile(`Asset not found: ${filePath}`);
    next();
  }
});

// Serve avatars directory
app.use('/avatars', (req, res, next) => {
  const filePath = path.join(STATIC_DIR, 'avatars', req.path);
  
  if (fs.existsSync(filePath)) {
    logToFile(`Avatar found: ${filePath}`);
    res.sendFile(filePath);
  } else {
    logToFile(`Avatar not found: ${filePath}`);
    next();
  }
});

// Serve static files
app.use(express.static(STATIC_DIR, {
  index: 'staging.html',
  setHeaders: (res, filePath) => {
    // Set proper content types based on extension
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// SPA fallback for frontend routing
app.get('*', (req, res) => {
  // Skip API routes (they should 404 if not handled)
  if (req.path.startsWith('/api/')) {
    logToFile(`API route not found: ${req.path}`);
    return res.status(404).send({ error: 'API endpoint not found' });
  }
  
  logToFile(`SPA fallback for: ${req.path}`);
  res.sendFile(path.join(STATIC_DIR, 'staging.html'));
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logToFile(`Server running at http://0.0.0.0:${PORT}`);
  logToFile(`Serving static files from: ${STATIC_DIR}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  logToFile('SIGINT received, shutting down gracefully');
  server.close(() => {
    logToFile('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  logToFile('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logToFile('Server closed');
    process.exit(0);
  });
});

// Keep the process alive
process.stdin.resume();