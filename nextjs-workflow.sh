#!/bin/bash

# Stop any existing Next.js processes
pkill -f "next dev" || true

# Configure environment
export NODE_ENV=development
export PORT=5000

# Start Next.js server
echo "Starting Next.js development server on port 5000..."
npx next dev -p 5000
