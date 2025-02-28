#!/bin/bash

# Prisma Setup Script for Solo Application
echo "Prisma Setup Script for Solo Application"

# Check if Prisma schema exists
if [ ! -f "./prisma/schema.prisma" ]; then
  echo "Error: Prisma schema not found!"
  exit 1
fi

# Create migrations directory if it doesn't exist
if [ ! -d "./prisma/migrations" ]; then
  echo "Creating migrations directory..."
  mkdir -p ./prisma/migrations
fi

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Create initial migration (use --create-only to avoid applying it yet)
echo "Creating initial migration (this may take a moment)..."
npx prisma migrate dev --name initial_migration --create-only

echo "Setup complete! Here are the next steps:"
echo "1. Review the migration files in ./prisma/migrations"
echo "2. Apply migrations with: npx prisma migrate dev"
echo "3. Test the Next.js development server with: ./start-next-dev.sh"
