/**
 * Stable Next.js Server Configuration
 * 
 * This server provides a reliable way to run Next.js in both development
 * and production environments with proper error handling and logging.
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Define constants
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const ENV = process.env.NODE_ENV || 'development';

// Configure Next.js
const dev = ENV !== 'production';
const app = next({ dev, dir: process.cwd() });
const handle = app.getRequestHandler();

// Logging utility
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌ ERROR:' : level === 'warn' ? '⚠️ WARNING:' : '✅ INFO:';
  console.log(`[${timestamp}] ${prefix} ${message}`);
  
  // Also log to file in production
  if (ENV === 'production' || ENV === 'staging') {
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(path.join(process.cwd(), 'next-server.log'), logMessage);
  }
}

// Start the server
async function startServer() {
  try {
    log(`Preparing Next.js app in ${ENV} mode...`);
    await app.prepare();
    
    log(`Environment: ${ENV}`);
    log(`Starting server on ${HOST}:${PORT}`);

    // Create HTTP server
    const server = createServer((req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url, true);
        
        // Let Next.js handle the request
        handle(req, res, parsedUrl);
      } catch (err) {
        log(`Error handling request: ${err.message}`, 'error');
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    // Add error handler
    server.on('error', (err) => {
      log(`Server error: ${err.message}`, 'error');
      if (err.code === 'EADDRINUSE') {
        log(`Port ${PORT} is already in use. Please use a different port.`, 'error');
        process.exit(1);
      }
    });

    // Start listening
    server.listen(PORT, HOST, (err) => {
      if (err) throw err;
      log(`Next.js server running at http://${HOST}:${PORT}`);
      
      // Write PID file for process management
      fs.writeFileSync(path.join(process.cwd(), 'next-server.pid'), process.pid.toString());
    });

    // Handle graceful shutdown
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    function gracefulShutdown() {
      log('Received shutdown signal, closing server...');
      server.close(() => {
        log('Server closed');
        process.exit(0);
      });
      
      // Force close after 10s if graceful shutdown fails
      setTimeout(() => {
        log('Forced shutdown after timeout', 'warn');
        process.exit(1);
      }, 10000);
    }
  } catch (err) {
    log(`Failed to start server: ${err.message}`, 'error');
    process.exit(1);
  }
}

// Run the server
startServer();