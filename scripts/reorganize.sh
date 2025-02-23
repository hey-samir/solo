#!/bin/bash

# Create necessary directories
mkdir -p src/config
mkdir -p env
mkdir -p scripts
mkdir -p src/docs
mkdir -p src/templates
mkdir -p src/server/utils
mkdir -p src/assets/images/avatars

# Move configuration files
mv src/config/postcss.config.mjs src/config/ 2>/dev/null || true
mv src/config/tailwind.config.js src/config/ 2>/dev/null || true
mv src/config/tsconfig.json src/config/ 2>/dev/null || true
mv src/config/vite.config.mjs src/config/ 2>/dev/null || true
mv version.json src/config/ 2>/dev/null || true

# Move environment files
mv .env.development env/ 2>/dev/null || true
mv .env.staging env/ 2>/dev/null || true

# Move HTML templates and clean up duplicates
mv index.html src/templates/ 2>/dev/null || true
mv staging.html src/templates/ 2>/dev/null || true
mv production.html src/templates/ 2>/dev/null || true
rm -f src/production.html 2>/dev/null || true  # Remove duplicate

# Move avatar images to assets directory
cp static/images/gray-solo-av.png src/assets/images/avatars/ 2>/dev/null || true
cp static/images/white-solo-av.png src/assets/images/avatars/ 2>/dev/null || true
cp static/images/black-solo-av.png src/assets/images/avatars/ 2>/dev/null || true
cp static/images/purple-solo-av.png src/assets/images/avatars/ 2>/dev/null || true

# Move error handling
mv errors.py src/server/utils/ 2>/dev/null || true

# Move assets
mv generated-icon.png src/assets/images/ 2>/dev/null || true

# Move scripts if not already in scripts directory
mv build.sh scripts/ 2>/dev/null || true
mv git_maintenance.sh scripts/ 2>/dev/null || true

# Make scripts executable
chmod +x scripts/*.sh

# Update imports in package.json to point to new locations
sed -i 's/"build": "vite build"/"build": "vite build --config src\/config\/vite.config.mjs"/' package.json
sed -i 's/"dev": "vite"/"dev": "vite --config src\/config\/vite.config.mjs"/' package.json

# Clean up duplicate files
rm -f src/production.html 2>/dev/null || true  # Remove duplicate production.html

# Print completion message
echo "File reorganization completed!"
echo "Remember to update any import paths in your code that reference moved files."