#!/bin/bash

# Start Next.js development server for the Solo application
echo "Starting Next.js development server..."

# Set environment variables
export NODE_ENV=development
export PORT=5000

# Check if Prisma schema exists
if [ -f "./prisma/schema.prisma" ]; then
  echo "Prisma schema found. Generating Prisma client..."
  npx prisma generate
else
  echo "Warning: Prisma schema not found! Database functionality may be limited."
fi

# Start the Next.js development server
echo "Running Next.js on port $PORT..."
npx next dev -p $PORT
