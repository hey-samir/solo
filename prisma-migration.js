/**
 * Prisma Migration Script
 * This script generates initial migrations for Prisma from the existing schema
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if Prisma schema exists
if (!fs.existsSync(path.join(process.cwd(), 'prisma', 'schema.prisma'))) {
  console.error('Error: Prisma schema not found');
  process.exit(1);
}

// Check if migrations directory exists and create it if not
const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  console.log('Creating migrations directory...');
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Generate initial migration
console.log('Generating initial Prisma migration...');
exec('npx prisma migrate dev --name initial_migration --create-only', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error generating migration: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Migration stderr: ${stderr}`);
    return;
  }
  
  console.log(`Migration generated successfully:\n${stdout}`);
  
  // Check if migration was created
  const migrationFiles = fs.readdirSync(migrationsDir);
  if (migrationFiles.length > 0) {
    console.log(`Migration files created: ${migrationFiles.join(', ')}`);
    
    // Suggest next steps
    console.log('\nNext steps:');
    console.log('1. Review the generated migration files');
    console.log('2. Apply migrations: npx prisma migrate dev');
    console.log('3. Generate Prisma client: npx prisma generate');
    console.log('4. Update API routes to use the new Prisma client');
  } else {
    console.log('No migration files were created. Check for errors.');
  }
});
