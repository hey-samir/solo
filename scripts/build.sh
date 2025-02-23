#!/bin/bash
set -e

echo "Starting build process..."

# Print current directory and Node environment
echo "Current directory: $(pwd)"
echo "Node environment: $NODE_ENV"

# Clean build directories and node_modules cache
echo "Cleaning build directories and cache..."
rm -rf dist
rm -rf .vite
mkdir -p dist/staging dist/production

# Build staging environment
echo "Building staging..."
NODE_ENV=staging npx vite build --mode staging --config src/config/vite.config.mjs
echo "Staging build complete. Contents of dist/staging:"
ls -la dist/staging/

# Verify build output
if [ ! -f "dist/staging/staging.html" ] && [ ! -f "dist/staging/index.html" ]; then
  echo "Error: Build failed - missing HTML template"
  exit 1
fi

if [ ! -f "dist/staging/manifest.json" ]; then
  echo "Error: Build failed - missing manifest.json"
  exit 1
fi

echo "Build completed successfully"
echo "Final directory structure:"
find dist/staging -type f