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

# Copy template files to root for Vite to find them
echo "Preparing templates..."
cp src/templates/staging.html staging.html
cp src/templates/index.html index.html

# Build staging environment
echo "Building staging..."
NODE_ENV=staging npx vite build --mode staging
echo "Staging build complete. Contents of dist/staging:"
ls -la dist/staging/

# Clean up temporary template files
rm staging.html index.html

# Verify build output
if [ ! -f "dist/staging/staging.html" ]; then
  echo "Error: Build failed - missing staging.html"
  exit 1
fi

if [ ! -f "dist/staging/manifest.json" ]; then
  echo "Error: Build failed - missing manifest.json"
  exit 1
fi

echo "Build completed successfully"
echo "Final directory structure:"
find dist/staging -type f