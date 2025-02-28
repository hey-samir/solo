#!/bin/bash

# Start Next.js development server
export PORT=5000
echo "Starting Next.js server on port $PORT"
npx next dev -p $PORT