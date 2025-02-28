/**
 * Stable Staging Server for Solo Application
 * 
 * This server provides:
 * 1. Static file serving for the staging build
 * 2. SPA fallback for client-side routing
 * 3. Proper MIME type handling
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Configuration constants
const PORT = process.env.PORT || 5000;
const STATIC_DIR = path.join(process.cwd(), 'dist/staging');
const SERVER_VERSION = '1.0.0';

// Create Express app
const app = express();

// Try to use compression if available
try {
  const compression = require('compression');
  app.use(compression());
  console.log('Compression middleware enabled');
} catch (err) {
  console.log('Compression middleware not available, skipping');
}

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Define content type mapping
const contentTypes = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// Helper function to set correct content types
function setContentTypeHeader(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (contentTypes[ext]) {
    res.setHeader('Content-Type', contentTypes[ext]);
  }
}

// Assets middleware with content type handling
app.use('/assets', (req, res, next) => {
  const filePath = path.join(STATIC_DIR, 'assets', req.path);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    setContentTypeHeader(res, filePath);
    res.sendFile(filePath);
  } else {
    next();
  }
});

// Serve avatars directory
app.use('/avatars', (req, res, next) => {
  const filePath = path.join(STATIC_DIR, 'avatars', req.path.replace(/^\/avatars\//, ''));
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    setContentTypeHeader(res, filePath);
    res.sendFile(filePath);
  } else {
    // Try the attached_assets directory as fallback
    const fallbackPath = path.join(process.cwd(), 'attached_assets', req.path.replace(/^\/avatars\//, ''));
    if (fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).isFile()) {
      setContentTypeHeader(res, fallbackPath);
      res.sendFile(fallbackPath);
    } else {
      next();
    }
  }
});

// Serve images directory
app.use('/images', (req, res, next) => {
  const filePath = path.join(STATIC_DIR, 'images', req.path.replace(/^\/images\//, ''));
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    setContentTypeHeader(res, filePath);
    res.sendFile(filePath);
  } else {
    next();
  }
});

// Serve manifest.json explicitly
app.get('/manifest.json', (req, res) => {
  const filePath = path.join(STATIC_DIR, 'manifest.json');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Manifest not found');
  }
});

// Static file serving with proper content type setting
app.use(express.static(STATIC_DIR, {
  index: 'staging.html',
  setHeaders: (res, filePath) => {
    setContentTypeHeader(res, filePath);
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: SERVER_VERSION,
    timestamp: new Date().toISOString(),
    environment: 'staging'
  });
});

// API fallback for feature flags
app.get('/api/feature-flags', (req, res) => {
  res.json({
    enableFeedback: true,
    enableProfileEditing: true,
    enableSoloMode: true,
    enableWorkoutTracking: false,
    enableCustomAvatars: false
  });
});

// SPA fallback for any unmatched routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(STATIC_DIR, 'staging.html'));
});

// Function to verify static directory exists
function checkStaticDirectory() {
  if (!fs.existsSync(STATIC_DIR)) {
    console.error(`Static directory not found: ${STATIC_DIR}`);
    return false;
  }
  
  if (!fs.existsSync(path.join(STATIC_DIR, 'staging.html'))) {
    console.error(`Index file not found: ${path.join(STATIC_DIR, 'staging.html')}`);
    return false;
  }
  
  console.log(`Static directory verified: ${STATIC_DIR}`);
  return true;
}

// Main function to start server with retries
function startServer() {
  console.log(`[Server] Staging server starting (version: ${SERVER_VERSION})...`);
  
  if (!checkStaticDirectory()) {
    console.log('[Server] Static directory not ready. Retrying in 5 seconds...');
    setTimeout(startServer, 5000);
    return;
  }
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Server] Serving static files from: ${STATIC_DIR}`);
    console.log(`[Server] Environment: staging`);
    
    // List available files for debugging
    try {
      const availableFiles = fs.readdirSync(STATIC_DIR);
      console.log(`[Server] Available files in root: ${availableFiles.join(', ')}`);
      
      const assetsPath = path.join(STATIC_DIR, 'assets');
      if (fs.existsSync(assetsPath) && fs.statSync(assetsPath).isDirectory()) {
        const assetFiles = fs.readdirSync(assetsPath);
        console.log(`[Server] Available asset files: ${assetFiles.join(', ')}`);
      }
    } catch (error) {
      console.error(`[Server] Error listing files: ${error.message}`);
    }
  });
  
  // Send heartbeat every 30 seconds to keep process alive
  const heartbeatInterval = setInterval(() => {
    console.log(`[Server] Heartbeat at ${new Date().toISOString()}`);
  }, 30000);
  
  // Handle graceful shutdown
  function gracefulShutdown() {
    console.log('[Server] Shutting down gracefully...');
    clearInterval(heartbeatInterval);
    
    server.close(() => {
      console.log('[Server] Server closed successfully');
      process.exit(0);
    });
    
    // Force close after 10 seconds if server doesn't close gracefully
    setTimeout(() => {
      console.log('[Server] Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  }
  
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('uncaughtException', (error) => {
    console.error('[Server] Uncaught exception:', error);
    gracefulShutdown();
  });
}

// Start the server
startServer();
