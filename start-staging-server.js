/**
 * Start Staging Server Script
 * Runs the simple Express server to serve the built staging assets 
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if static directory exists
const STATIC_DIR = path.join(process.cwd(), 'dist/staging');
if (!fs.existsSync(STATIC_DIR)) {
  console.error(`Static directory not found: ${STATIC_DIR}`);
  console.error('Please run the build:staging script first');
  process.exit(1);
}

console.log('Starting staging server...');
console.log(`Static directory: ${STATIC_DIR}`);
console.log(`Available files: ${fs.readdirSync(STATIC_DIR).join(', ')}`);

// Start the server
const server = spawn('node', ['simple-server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'staging'
  }
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill('SIGINT');
});