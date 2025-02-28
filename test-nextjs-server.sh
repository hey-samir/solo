#!/bin/bash

# Test Next.js Development Server
# This script starts the Next.js development server for testing

# Set environment variables
export NODE_ENV=development
export PORT=5000

echo "Starting Next.js Development Server Test..."

# Check for required files
if [ ! -f "./pages/_app.tsx" ]; then
  echo "Error: Next.js _app.tsx file not found!"
  exit 1
fi

if [ ! -f "./next.config.js" ]; then
  echo "Error: next.config.js not found!"
  exit 1
fi

# Check if Prisma client is generated
if [ ! -d "./node_modules/.prisma/client" ]; then
  echo "Generating Prisma client..."
  npx prisma generate
fi

# Kill any existing process on the port
echo "Checking for existing processes on port $PORT..."
lsof -ti:$PORT | xargs kill -9 2>/dev/null || true

# Start the Next.js development server
echo "Starting Next.js development server on port $PORT..."
npx next dev -p $PORT
