#!/bin/bash

# Test the Staging Server
# This script starts the staging server to test the recent Vite build

echo "Testing Staging Server for Solo App..."
PORT=5000

# Check if the build directory exists
if [ ! -d "./dist/staging" ]; then
  echo "Error: Staging build not found! Run the staging build workflow first."
  exit 1
fi

# Check for the main staging HTML file
if [ ! -f "./dist/staging/staging.html" ]; then
  echo "Error: staging.html not found in the build directory!"
  exit 1
fi

# Kill any existing process on the port
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# Start the server
echo "Starting staging server on port $PORT..."
node staging-server.js > staging-server.log 2>&1 &
SERVER_PID=$!

# Save PID to file
echo $SERVER_PID > staging-server.pid

# Wait for server to start
echo "Waiting for server to start..."
sleep 3

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
  echo "Staging server started successfully (PID: $SERVER_PID)"
  echo "You can access it at: http://localhost:$PORT"
  echo "Check staging-server.log for server output"
else
  echo "Error: Server failed to start or crashed immediately."
  echo "Check staging-server.log for error details:"
  cat staging-server.log
  exit 1
fi
