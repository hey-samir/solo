#!/bin/bash

# Set environment variables
export NODE_ENV=staging
export PORT=5000

# Kill any existing node processes running our server scripts
echo "Stopping any running server processes..."
pkill -f "node stable-staging-server.js" || true
pkill -f "node start-staging-server.js" || true
pkill -f "node simple-server.js" || true

sleep 1

# Start the server
echo "Starting stable staging server..."
node stable-staging-server.js
