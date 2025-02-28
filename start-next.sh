#!/bin/bash

# Set environment variables
export NODE_ENV=development
export PORT=5000

# Navigate to project root
cd $(dirname $0)

echo "Starting Next.js server on port 5000..."
node_modules/.bin/next dev -p 5000 -H 0.0.0.0
