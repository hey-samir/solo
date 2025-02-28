/**
 * Migration Check Script
 * This script checks the environment for migration readiness
 */

const fs = require('fs');
const path = require('path');

function checkDirectoryExists(dir) {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch (err) {
    return false;
  }
}

function checkFileExists(file) {
  try {
    return fs.existsSync(file) && fs.statSync(file).isFile();
  } catch (err) {
    return false;
  }
}

function main() {
  console.log('=== Migration Environment Check ===');
  console.log('Checking for Next.js environment...');
  
  // Check for Next.js directories
  const hasNextPagesDir = checkDirectoryExists('./pages');
  const hasComponentsDir = checkDirectoryExists('./components');
  const hasPublicDir = checkDirectoryExists('./public');
  
  console.log(`✓ Next.js pages directory: ${hasNextPagesDir ? 'Found' : 'Not found'}`);
  console.log(`✓ Components directory: ${hasComponentsDir ? 'Found' : 'Not found'}`);
  console.log(`✓ Public directory: ${hasPublicDir ? 'Found' : 'Not found'}`);
  
  // Check for Next.js config
  const hasNextConfig = checkFileExists('./next.config.js');
  console.log(`✓ Next.js config: ${hasNextConfig ? 'Found' : 'Not found'}`);
  
  // Check for Vite build output
  const hasViteBuild = checkDirectoryExists('./dist/staging');
  console.log(`✓ Vite build output: ${hasViteBuild ? 'Found' : 'Not found'}`);
  
  // Check for Prisma setup
  const hasPrismaSchema = checkFileExists('./prisma/schema.prisma');
  const hasPrismaMigrations = checkDirectoryExists('./prisma/migrations');
  console.log(`✓ Prisma schema: ${hasPrismaSchema ? 'Found' : 'Not found'}`);
  console.log(`✓ Prisma migrations: ${hasPrismaMigrations ? 'Found' : 'Not found'}`);
  
  // Check for Drizzle setup
  const hasDrizzleMigrations = checkDirectoryExists('./drizzle/migrations');
  console.log(`✓ Drizzle migrations: ${hasDrizzleMigrations ? 'Found' : 'Not found'}`);
  
  // Check for server scripts
  const hasViteServer = checkFileExists('./server.js');
  const hasNextjsServer = checkFileExists('./start-nextjs.js');
  console.log(`✓ Vite server: ${hasViteServer ? 'Found' : 'Not found'}`);
  console.log(`✓ Next.js server: ${hasNextjsServer ? 'Found' : 'Not found'}`);
  
  console.log('\n=== Migration Readiness Summary ===');
  if (hasNextPagesDir && hasComponentsDir && hasNextConfig) {
    console.log('✅ Next.js environment is ready for migration');
  } else {
    console.log('❌ Next.js environment not fully configured');
  }
  
  if (hasPrismaSchema) {
    console.log('✅ Prisma ORM is configured');
  } else {
    console.log('❌ Prisma ORM not fully configured');
  }
  
  if (hasViteBuild && hasViteServer) {
    console.log('ℹ️ Vite build system is active');
  }
  
  if (hasDrizzleMigrations) {
    console.log('ℹ️ Drizzle migrations exist and need migration to Prisma');
  }
  
  console.log('\n=== Next Steps ===');
  if (!hasPrismaSchema) {
    console.log('1. Set up Prisma schema based on Drizzle schema');
  }
  if (!hasPrismaMigrations) {
    console.log('2. Create initial Prisma migration from schema');
  }
  console.log('3. Update Next.js API routes to use Prisma client');
  console.log('4. Run and test Next.js server in development mode');
  console.log('5. Create production build pipeline for Next.js');
}

main();
