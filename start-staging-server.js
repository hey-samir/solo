/**
 * Start Staging Server Script
 * Runs the Express server to serve the built staging assets 
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Configuration
const PORT = process.env.PORT || 5000;
const STATIC_DIR = path.join(process.cwd(), 'dist/staging');

// Verify static directory exists
function checkStaticDir() {
  if (!fs.existsSync(STATIC_DIR)) {
    console.error(`Error: Static directory not found: ${STATIC_DIR}`);
    return false;
  }
  
  console.log(`[Server] Static directory: ${STATIC_DIR}`);
  try {
    const files = fs.readdirSync(STATIC_DIR);
    console.log(`[Server] Available files:`, files);
    return true;
  } catch (error) {
    console.error(`Error reading static directory: ${error.message}`);
    return false;
  }
}

// Function to start the server
function startServer() {
  console.log(`[Server] Starting at ${new Date().toISOString()}`);
  
  if (!checkStaticDir()) {
    console.log('[Server] Static directory not ready. Retrying in 5 seconds...');
    setTimeout(startServer, 5000);
    return;
  }

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    console.error(err.stack);
    res.status(500).send('Server Error');
    next(err);
  });

  // Serve assets directory with specific content types
  app.use('/assets', (req, res, next) => {
    const filePath = path.join(STATIC_DIR, 'assets', req.path);
    
    if (fs.existsSync(filePath)) {
      // Set proper content types based on file extension
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
      next();
    }
  });

  // Serve avatars directory
  app.use('/avatars', (req, res, next) => {
    const filePath = path.join(STATIC_DIR, 'avatars', req.path.replace(/^\/avatars\//, ''));
    
    if (fs.existsSync(filePath)) {
      if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
      
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // Serve images directory
  app.use('/images', (req, res, next) => {
    const filePath = path.join(STATIC_DIR, 'images', req.path.replace(/^\/images\//, ''));
    
    if (fs.existsSync(filePath)) {
      if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }
      
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // Serve static files
  app.use(express.static(STATIC_DIR, {
    index: 'staging.html',
    setHeaders: (res, filePath) => {
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
    }
  }));

  // SPA fallback
  app.get('*', (req, res) => {
    // Skip API routes (they should 404 if not handled)
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.sendFile(path.join(STATIC_DIR, 'staging.html'));
  });

  // Start server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running at http://0.0.0.0:${PORT}`);
    console.log(`[Server] Serving static files from: ${STATIC_DIR}`);
    console.log(`[Server] Started at: ${new Date().toISOString()}`);
  });

  // Heartbeat to keep process alive
  setInterval(() => {
    console.log(`[Server] Heartbeat at ${new Date().toISOString()}`);
  }, 30000);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('[Server] SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('[Server] Server closed');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('[Server] Server closed');
      process.exit(0);
    });
  });
}

// Start the server
startServer();
