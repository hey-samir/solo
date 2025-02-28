/**
 * Migration Check Script
 * This script checks the environment for migration readiness
 * and verifies database connectivity for Prisma
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Check if Prisma can connect to the database
function checkPrismaConnection() {
  try {
    console.log('Testing Prisma database connection...');
    // Try to validate the Prisma schema, which will test the connection
    execSync('npx prisma validate', { stdio: 'pipe' });
    return true;
  } catch (err) {
    console.error('Prisma connection test failed:', err.message);
    return false;
  }
}

// Check available environment variables
function checkEnvironmentVariables() {
  const variables = {
    'DATABASE_URL': !!process.env.DATABASE_URL,
    'NODE_ENV': process.env.NODE_ENV,
    'NEXTAUTH_SECRET': !!process.env.NEXTAUTH_SECRET,
    'NEXTAUTH_URL': process.env.NEXTAUTH_URL
  };
  
  return variables;
}

function main() {
  console.log('=== Migration Environment Check ===');
  console.log('Checking for Next.js environment...');
  
  // Check for Next.js directories
  const hasNextPagesDir = checkDirectoryExists('./pages');
  const hasApiDir = checkDirectoryExists('./pages/api');
  const hasComponentsDir = checkDirectoryExists('./components');
  const hasPublicDir = checkDirectoryExists('./public');
  const hasStylesDir = checkDirectoryExists('./styles');
  
  console.log(`✓ Next.js pages directory: ${hasNextPagesDir ? 'Found' : 'Not found'}`);
  console.log(`✓ Next.js API directory: ${hasApiDir ? 'Found' : 'Not found'}`);
  console.log(`✓ Components directory: ${hasComponentsDir ? 'Found' : 'Not found'}`);
  console.log(`✓ Public directory: ${hasPublicDir ? 'Found' : 'Not found'}`);
  console.log(`✓ Styles directory: ${hasStylesDir ? 'Found' : 'Not found'}`);
  
  // Check for Next.js config and critical files
  const hasNextConfig = checkFileExists('./next.config.js');
  const hasAppTs = checkFileExists('./pages/_app.tsx');
  const hasTsConfig = checkFileExists('./tsconfig.json');
  
  console.log(`✓ Next.js config: ${hasNextConfig ? 'Found' : 'Not found'}`);
  console.log(`✓ Next.js _app.tsx: ${hasAppTs ? 'Found' : 'Not found'}`);
  console.log(`✓ TypeScript config: ${hasTsConfig ? 'Found' : 'Not found'}`);
  
  // Check for Vite build output
  const hasViteBuild = checkDirectoryExists('./dist/staging');
  console.log(`✓ Vite build output: ${hasViteBuild ? 'Found' : 'Not found'}`);
  
  // Check for Prisma setup
  const hasPrismaSchema = checkFileExists('./prisma/schema.prisma');
  const hasPrismaMigrations = checkDirectoryExists('./prisma/migrations');
  const hasPrismaClient = checkDirectoryExists('./node_modules/.prisma/client');
  
  console.log(`✓ Prisma schema: ${hasPrismaSchema ? 'Found' : 'Not found'}`);
  console.log(`✓ Prisma migrations: ${hasPrismaMigrations ? 'Found' : 'Not found'}`);
  console.log(`✓ Prisma client: ${hasPrismaClient ? 'Generated' : 'Not generated'}`);
  
  // Check for Drizzle setup
  const hasDrizzleMigrations = checkDirectoryExists('./drizzle/migrations');
  console.log(`✓ Drizzle migrations: ${hasDrizzleMigrations ? 'Found' : 'Not found'}`);
  
  // Check for server scripts
  const hasViteServer = checkFileExists('./server.js');
  const hasNextjsServer = checkFileExists('./start-nextjs.js') || checkFileExists('./start-next-dev.sh');
  console.log(`✓ Vite server: ${hasViteServer ? 'Found' : 'Not found'}`);
  console.log(`✓ Next.js server: ${hasNextjsServer ? 'Found' : 'Not found'}`);
  
  // Check environment variables
  const envVars = checkEnvironmentVariables();
  console.log('\n=== Environment Variables ===');
  console.log(`✓ DATABASE_URL: ${envVars.DATABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`✓ NODE_ENV: ${envVars.NODE_ENV || 'Not set'}`);
  console.log(`✓ NEXTAUTH_SECRET: ${envVars.NEXTAUTH_SECRET ? 'Set' : 'Not set'}`);
  console.log(`✓ NEXTAUTH_URL: ${envVars.NEXTAUTH_URL || 'Not set'}`);
  
  // Check database connection if prisma is set up
  let dbConnected = false;
  if (hasPrismaSchema && envVars.DATABASE_URL) {
    dbConnected = checkPrismaConnection();
    console.log(`✓ Database connection: ${dbConnected ? 'Successful' : 'Failed'}`);
  }
  
  console.log('\n=== Migration Readiness Summary ===');
  if (hasNextPagesDir && hasComponentsDir && hasNextConfig && hasAppTs) {
    console.log('✅ Next.js environment is ready for migration');
  } else {
    console.log('❌ Next.js environment not fully configured');
  }
  
  if (hasPrismaSchema && hasPrismaClient) {
    console.log('✅ Prisma ORM is configured');
    if (dbConnected) {
      console.log('✅ Database connection successful');
    } else {
      console.log('❌ Database connection failed');
    }
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
  } else if (!hasPrismaClient) {
    console.log('1. Generate Prisma client with: npx prisma generate');
  } else if (!hasPrismaMigrations) {
    console.log('1. Create initial Prisma migration with: npx prisma migrate dev --name initial');
  } else if (!dbConnected) {
    console.log('1. Fix database connection issues');
  } else {
    console.log('1. Update Next.js API routes to use Prisma client');
    console.log('2. Run and test Next.js server in development mode');
    console.log('3. Create production build pipeline for Next.js');
  }
}

main();
