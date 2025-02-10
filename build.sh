#!/bin/bash
set -e

echo "Starting build process..."

# Clean build directories
rm -rf dist/client
mkdir -p dist/client/staging dist/client/production

# Build both environments
echo "Building staging environment..."
NODE_ENV=staging npx vite build --mode staging

echo "Building production environment..."
NODE_ENV=production npx vite build --mode production

# Verify build output
if [ ! -f "dist/client/staging/index.html" ] || [ ! -f "dist/client/production/index.html" ]; then
  echo "Error: Build failed - missing index.html files"
  exit 1
fi

echo "Build completed successfully"
