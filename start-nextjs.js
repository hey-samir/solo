/**
 * Next.js Server Starter (Migration Version)
 * This script manages the startup of a Next.js development server
 * for the Solo climbing application migration
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Logging utility
function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌ ERROR:' : level === 'warn' ? '⚠️ WARNING:' : '✅ INFO:';
  console.log(`[${timestamp}] ${prefix} ${message}`);
  
  // Also log to file in production
  if (NODE_ENV === 'production' || NODE_ENV === 'staging') {
    try {
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
      fs.appendFileSync(path.join(process.cwd(), 'nextjs-server.log'), logMessage);
    } catch (err) {
      console.error(`Failed to write to log file: ${err.message}`);
    }
  }
}

// Verify environment
function checkEnvironment() {
  log(`Starting server in ${NODE_ENV} environment`);
  
  if (!fs.existsSync(path.join(process.cwd(), 'pages'))) {
    log('Next.js pages directory not found', 'error');
    return false;
  }
  
  if (!fs.existsSync(path.join(process.cwd(), 'prisma', 'schema.prisma'))) {
    log('Prisma schema file not found', 'warn');
  }
  
  return true;
}

// Start the Next.js development server
async function startServer() {
  try {
    // Check environment first
    if (!checkEnvironment()) {
      process.exit(1);
    }
    
    log(`Starting Next.js server on port ${PORT}`);
    
    // Set environment variables
    const env = { 
      ...process.env,
      PORT,
      NODE_ENV,
    };
    
    // Spawn Next.js dev process
    const serverCommand = NODE_ENV === 'development' ? 'dev' : 'start';
    const nextProcess = spawn('npx', ['next', serverCommand, '-p', PORT], {
      env,
      stdio: 'inherit',
      shell: true
    });
    
    // Handle process events
    nextProcess.on('error', (err) => {
      log(`Failed to start Next.js server: ${err.message}`, 'error');
      process.exit(1);
    });
    
    nextProcess.on('close', (code) => {
      if (code !== 0) {
        log(`Next.js server process exited with code ${code}`, 'error');
        process.exit(code);
      }
    });
    
    // Handle termination signals
    process.on('SIGINT', () => {
      log('Received SIGINT signal, shutting down Next.js server', 'info');
      nextProcess.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      log('Received SIGTERM signal, shutting down Next.js server', 'info');
      nextProcess.kill('SIGTERM');
      process.exit(0);
    });
    
    // Write PID file for process management
    fs.writeFileSync(path.join(process.cwd(), 'nextjs-server.pid'), process.pid.toString());
    
  } catch (err) {
    log(`Error starting server: ${err.message}`, 'error');
    process.exit(1);
  }
}

// Run the server
startServer();
