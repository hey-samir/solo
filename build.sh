#!/bin/bash
set -e

echo "Starting build process..."

# Print current directory and Node environment
echo "Current directory: $(pwd)"
echo "Node environment: $NODE_ENV"

# Clean build directories and node_modules cache
echo "Cleaning build directories and cache..."
rm -rf dist/client
rm -rf .vite
mkdir -p dist/client/staging dist/client/production
echo "Created directory structure:"
ls -la dist/client/

# Build staging environment
echo "Building staging..."
NODE_ENV=staging npx vite build --mode staging
echo "Staging build complete. Contents of dist/client/staging:"
ls -la dist/client/staging/

# Build production environment
echo "Building production..."
NODE_ENV=production npx vite build --mode production
echo "Production build complete. Contents of dist/client/production:"
ls -la dist/client/production/

# Verify build output
if [ ! -f "dist/client/staging/index.html" ] || [ ! -f "dist/client/production/index.html" ]; then
  echo "Error: Build failed - missing index.html files"
  exit 1
fi

echo "Build completed successfully"
echo "Final directory structure:"
find dist/client -type f