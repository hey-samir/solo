/**
 * Next.js Server Starter
 * This script manages the startup of a Next.js development server
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Logging utility
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Start the Next.js development server
function startServer() {
  log(`Starting Next.js server in ${NODE_ENV} mode on port ${PORT}`);
  
  // Set environment variables
  const env = { 
    ...process.env,
    PORT,
    NODE_ENV,
  };
  
  // Spawn Next.js dev process
  const nextProcess = spawn('npx', ['next', 'dev', '-p', PORT], {
    env,
    stdio: 'inherit',
    shell: true
  });
  
  // Handle process events
  nextProcess.on('error', (err) => {
    log(`Failed to start Next.js server: ${err.message}`);
    process.exit(1);
  });
  
  nextProcess.on('close', (code) => {
    if (code !== 0) {
      log(`Next.js server process exited with code ${code}`);
      process.exit(code);
    }
  });
  
  // Handle termination signals
  process.on('SIGINT', () => {
    log('Received SIGINT signal, shutting down Next.js server');
    nextProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('Received SIGTERM signal, shutting down Next.js server');
    nextProcess.kill('SIGTERM');
    process.exit(0);
  });
}

// Start the server
startServer();
