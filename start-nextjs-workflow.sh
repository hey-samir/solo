#!/bin/bash
# This script starts the Next.js server for the Replit workflow system
echo "Starting Next.js server at $(date)"

# Set environment variables
export PORT=5000
export NODE_ENV=development

# Attempt to start the server with proper logging
node start-nextjs-server.js

# If the server fails, let us provide a fallback
if [ $? -ne 0 ]; then
  echo "Attempting fallback server start method..."
  npx next dev -p 5000
fi
