#!/bin/bash

# This script runs the Next.js server for the migrated Solo application

# Set environment variables
export NODE_ENV=${NODE_ENV:-"development"}
export PORT=${PORT:-5000}

echo "Starting Next.js server in $NODE_ENV mode on port $PORT"

# Run the server with proper error handling
node start-nextjs.js
