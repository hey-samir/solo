/**
 * Simple Next.js development server starter
 */

const { spawn } = require('child_process');

// Configuration
const PORT = process.env.PORT || 5000;

console.log(`Starting Next.js development server on port ${PORT}`);

// Start Next.js dev server
const nextProcess = spawn('npx', ['next', 'dev', '-p', PORT], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: PORT.toString()
  }
});

// Handle process events
nextProcess.on('error', (err) => {
  console.error(`Failed to start Next.js server: ${err.message}`);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Next.js server process exited with code ${code}`);
    process.exit(code);
  }
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down Next.js server');
  nextProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down Next.js server');
  nextProcess.kill('SIGTERM');
  process.exit(0);
});
