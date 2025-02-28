#!/bin/bash

# This script handles starting the Solo App server
# Usage: ./start-workflow.sh [start|stop|status]

# Configuration
LOG_FILE="staging-server.log"
PID_FILE="/tmp/solo-server.pid"
SERVER_SCRIPT="stable-staging-server.js"

# Function to check if server is running
check_server() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null; then
      return 0  # Server is running
    fi
  fi
  return 1  # Server is not running
}

# Function to start the server
start_server() {
  echo "Starting staging server..."
  
  # Check if already running
  if check_server; then
    echo "Server is already running with PID $(cat "$PID_FILE")"
    return
  fi
  
  # Create server file if it doesn't exist
  if [ ! -f "$SERVER_SCRIPT" ]; then
    cat > "$SERVER_SCRIPT" << 'EOF'
/**
 * Stable Staging Server for Solo App
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 5000;
const STATIC_DIR = path.join(process.cwd(), 'dist/staging');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/font-ttf'
};

// Create server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Special case for API endpoints
  if (req.url.startsWith('/api/feature-flags')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      enableFeedback: true,
      enableProfileEditing: true,
      enableSoloMode: true
    }));
    return;
  }
  
  // Serve file or fallback to index
  let filePath = path.join(STATIC_DIR, req.url === '/' ? 'staging.html' : req.url);
  
  // Handle asset requests specially
  if (req.url.startsWith('/assets/')) {
    filePath = path.join(STATIC_DIR, req.url);
  }
  
  const extname = path.extname(filePath).toLowerCase();
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist - serve index for SPA routing (not for API)
      if (!req.url.startsWith('/api/')) {
        filePath = path.join(STATIC_DIR, 'staging.html');
        serveFile(filePath, 'text/html', res);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
      return;
    }
    
    // Serve the file
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    serveFile(filePath, contentType, res);
  });
});

// Helper to serve a file
function serveFile(filePath, contentType, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end('Not found');
      } else {
        console.error(`Server error: ${err.code}`);
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`Serving from: ${STATIC_DIR}`);
  
  // Create minimal test files if needed
  if (!fs.existsSync(STATIC_DIR)) {
    fs.mkdirSync(STATIC_DIR, { recursive: true });
    console.log(`Created directory: ${STATIC_DIR}`);
  }
  
  if (!fs.existsSync(path.join(STATIC_DIR, 'assets'))) {
    fs.mkdirSync(path.join(STATIC_DIR, 'assets'), { recursive: true });
  }
  
  if (!fs.existsSync(path.join(STATIC_DIR, 'staging.html'))) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Solo App - Staging</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 430px; 
              margin: 0 auto; 
              padding: 20px;
            }
            h1 { color: #6200ee; }
          </style>
        </head>
        <body>
          <h1>Solo App Staging</h1>
          <p>This is a placeholder for the staging environment.</p>
          <div id="app"></div>
        </body>
      </html>
    `;
    fs.writeFileSync(path.join(STATIC_DIR, 'staging.html'), html);
    console.log('Created staging.html file');
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
EOF
  fi
  
  # Start the server with Node.js
  # Try several possible node commands
  NODE_CMD=""
  for cmd in "node" "nodejs" "/usr/bin/node" "/usr/local/bin/node"; do
    if command -v $cmd &> /dev/null; then
      NODE_CMD=$cmd
      break
    fi
  done
  
  if [ -z "$NODE_CMD" ]; then
    echo "Error: Node.js is not installed or not in PATH"
    return 1
  fi
  
  # Start server and save PID
  $NODE_CMD "$SERVER_SCRIPT" > "$LOG_FILE" 2>&1 &
  PID=$!
  echo $PID > "$PID_FILE"
  echo "Server started with PID $PID"
}

# Function to stop the server
stop_server() {
  if check_server; then
    PID=$(cat "$PID_FILE")
    echo "Stopping server with PID $PID..."
    kill $PID
    rm -f "$PID_FILE"
    echo "Server stopped"
  else
    echo "Server is not running"
  fi
}

# Function to check server status
status_server() {
  if check_server; then
    echo "Server is running with PID $(cat "$PID_FILE")"
  else
    echo "Server is not running"
  fi
}

# Main script logic
case "$1" in
  start)
    start_server
    ;;
  stop)
    stop_server
    ;;
  restart)
    stop_server
    sleep 2
    start_server
    ;;
  status)
    status_server
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
    ;;
esac

exit 0