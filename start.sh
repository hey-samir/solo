#!/bin/bash

# Solo App Server Starter Script

# Kill any existing server processes
echo "Stopping any existing server processes..."
pkill -f "node simple-server.js" || true
pkill -f "node start-server.js" || true

# Start the server directly
echo "Starting simple staging server..."
node simple-server.js &

# Wait for server to initialize
sleep 2

# Check if server is running
if pgrep -f "node simple-server.js" > /dev/null; then
    echo "Server started successfully on port 5000"
    echo "Monitor with: tail -f server.log"
else
    echo "Server failed to start."
fi
