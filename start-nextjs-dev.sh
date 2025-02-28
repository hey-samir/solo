#!/bin/bash

echo "Starting Next.js development server..."
export NODE_ENV=development
export PORT=5000

# Run the Next.js development server
npx next dev -p 5000 -H 0.0.0.0
