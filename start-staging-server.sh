#!/bin/bash

# Set environment variables
export NODE_ENV=staging
export PORT=5000

# Kill any existing node processes
pkill -f "node start-staging-server.js" || true

# Start the server
echo "Starting staging server..."
node start-staging-server.js
