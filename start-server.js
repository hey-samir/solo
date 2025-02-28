/**
 * Solo App Server Starter
 * This script launches the appropriate server based on the environment
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'staging';
const LOG_FILE = 'server.log';

// Log message with timestamp to console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage);
}

// Check if dist/staging directory exists
function checkBuildExists() {
  const stagingDir = path.join(process.cwd(), 'dist/staging');
  return fs.existsSync(stagingDir) && fs.existsSync(path.join(stagingDir, 'staging.html'));
}

// Main function to start the server
function startServer() {
  // Initial logging
  log(`Starting ${ENV} environment...`);
  
  // Check if build exists
  if (!checkBuildExists()) {
    log('Build not found. Please run the build workflow first.');
    log('Will retry in 10 seconds...');
    setTimeout(startServer, 10000);
    return;
  }

  // Determine which server script to use
  let serverScript = 'stable-staging-server.js';
  
  log(`Launching server with: ${serverScript}`);
  
  // Launch the server as a child process
  const server = spawn('node', [serverScript], {
    env: {
      ...process.env,
      PORT: PORT.toString(),
      NODE_ENV: ENV
    },
    stdio: 'pipe' // Capture all stdio
  });
  
  // Setup logging for stdout
  server.stdout.on('data', (data) => {
    const message = data.toString().trim();
    log(`[SERVER] ${message}`);
  });
  
  // Setup logging for stderr
  server.stderr.on('data', (data) => {
    const message = data.toString().trim();
    log(`[SERVER ERROR] ${message}`);
  });
  
  // Handle server process exit
  server.on('exit', (code, signal) => {
    log(`Server process exited with code ${code} and signal ${signal || 'none'}`);
    
    // Restart server after a delay
    log('Restarting server in 5 seconds...');
    setTimeout(startServer, 5000);
  });
  
  // Handle errors in spawning the process
  server.on('error', (err) => {
    log(`Failed to start server process: ${err.message}`);
    log('Retrying in 10 seconds...');
    setTimeout(startServer, 10000);
  });
}

// Initialize log file
fs.writeFileSync(LOG_FILE, `=== SERVER STARTED AT ${new Date().toISOString()} ===\n`);

// Start the server
startServer();
