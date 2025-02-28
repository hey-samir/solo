#!/bin/bash

# Next.js Development Server Workflow
# This script starts the Next.js development server in the background
# and monitors it for the port to be available

NODE_ENV=development
PORT=5000

echo "Starting Next.js Development Server on port $PORT..."

# Check if Prisma client needs to be generated
if [ -f ./prisma/schema.prisma ]; then
  echo "Generating Prisma client..."
  npx prisma generate
fi

# Start the Next.js development server
echo "$(date): Starting Next.js development server..."
npx next dev -p $PORT &
NEXT_PID=$!

# Save the PID for later use
echo $NEXT_PID > nextjs-server.pid

# Function to check if the server is running
check_server() {
  if ps -p $NEXT_PID > /dev/null; then
    return 0
  else
    return 1
  fi
}

# Wait for the server to start
echo "Waiting for Next.js server to become available..."
MAX_WAIT=60
WAIT_COUNT=0

while ! nc -z localhost $PORT; do
  if ! check_server; then
    echo "Error: Next.js server process has terminated unexpectedly."
    exit 1
  fi
  
  sleep 1
  WAIT_COUNT=$((WAIT_COUNT + 1))
  
  if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
    echo "Error: Timed out waiting for Next.js server to start."
    kill $NEXT_PID 2>/dev/null
    exit 1
  fi
  
  # Show progress every 5 seconds
  if [ $((WAIT_COUNT % 5)) -eq 0 ]; then
    echo "Still waiting for server to start... ($WAIT_COUNT seconds)"
  fi
done

echo "Next.js server is running on port $PORT (PID: $NEXT_PID)"
echo "Server logs will be available in next-server.log"

# Redirect logs
exec > next-server.log 2>&1
tail -f next-server.log
