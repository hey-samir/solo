/**
 * Prisma Migration Check Script
 * 
 * This script checks for potential migration issues when moving from Drizzle to Prisma
 * and validates the current state of the database against the Prisma schema.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PRISMA_SCHEMA_PATH = './prisma/schema.prisma';

// Check if the Prisma schema exists
function checkPrismaSchema() {
  if (!fs.existsSync(PRISMA_SCHEMA_PATH)) {
    console.error(`Error: Prisma schema not found at ${PRISMA_SCHEMA_PATH}`);
    return false;
  }
  return true;
}

// Check if the database URL is set
function checkDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    return false;
  }
  return true;
}

// Run Prisma introspection to compare the database with the schema
async function checkDatabaseSync() {
  try {
    console.log('Running Prisma introspection to check database state...');
    
    // Create a temporary directory for the introspection output
    const tempDir = './prisma/temp-introspection';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Create a temporary schema file
    const tempSchemaPath = path.join(tempDir, 'schema.prisma');
    fs.writeFileSync(tempSchemaPath, `
      generator client {
        provider = "prisma-client-js"
        output   = "./generated-client"
      }
      
      datasource db {
        provider = "postgresql"
        url      = env("DATABASE_URL")
      }
    `);
    
    // Run introspection
    execSync(`npx prisma db pull --schema=${tempSchemaPath}`, { stdio: 'inherit' });
    
    // Read the introspected schema
    const introspectedSchema = fs.readFileSync(tempSchemaPath, 'utf8');
    
    // Read the defined schema
    const definedSchema = fs.readFileSync(PRISMA_SCHEMA_PATH, 'utf8');
    
    // Compare schemas (basic check - would need more advanced parsing for real applications)
    const introspectedModels = extractModelNames(introspectedSchema);
    const definedModels = extractModelNames(definedSchema);
    
    console.log('\nComparing schemas:');
    console.log('Defined models:', definedModels);
    console.log('Introspected models:', introspectedModels);
    
    // Find missing models
    const missingInDatabase = definedModels.filter(model => !introspectedModels.includes(model));
    const missingInSchema = introspectedModels.filter(model => !definedModels.includes(model));
    
    if (missingInDatabase.length > 0) {
      console.warn('\nWARNING: The following models are in the schema but not in the database:');
      missingInDatabase.forEach(model => console.warn(`- ${model}`));
      console.warn('These tables will need to be created during migration.');
    }
    
    if (missingInSchema.length > 0) {
      console.warn('\nWARNING: The following models are in the database but not in the schema:');
      missingInSchema.forEach(model => console.warn(`- ${model}`));
      console.warn('These tables should be added to the schema or dropped from the database.');
    }
    
    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    return missingInDatabase.length === 0 && missingInSchema.length === 0;
    
  } catch (error) {
    console.error('Error checking database sync:', error.message);
    return false;
  }
}

// Helper function to extract model names from a schema
function extractModelNames(schema) {
  const modelRegex = /model\s+(\w+)\s+{/g;
  const models = [];
  let match;
  
  while ((match = modelRegex.exec(schema)) !== null) {
    models.push(match[1]);
  }
  
  return models;
}

// Run Prisma validate to check for schema errors
function validatePrismaSchema() {
  try {
    console.log('\nValidating Prisma schema...');
    execSync(`npx prisma validate`, { stdio: 'inherit' });
    console.log('Schema validation successful!');
    return true;
  } catch (error) {
    console.error('Schema validation failed:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting Prisma Migration Check...');
  
  // Check prerequisites
  const schemaExists = checkPrismaSchema();
  const dbUrlExists = checkDatabaseUrl();
  
  if (!schemaExists || !dbUrlExists) {
    console.error('Prerequisite checks failed. Exiting.');
    process.exit(1);
  }
  
  // Validate schema
  const schemaValid = validatePrismaSchema();
  if (!schemaValid) {
    console.error('Schema validation failed. Please fix the errors before proceeding.');
    process.exit(1);
  }
  
  // Check database sync
  const dbInSync = await checkDatabaseSync();
  
  console.log('\nMigration Check Summary:');
  console.log('- Prisma Schema: ' + (schemaExists ? '✅ Found' : '❌ Missing'));
  console.log('- Database URL: ' + (dbUrlExists ? '✅ Set' : '❌ Missing'));
  console.log('- Schema Validation: ' + (schemaValid ? '✅ Valid' : '❌ Invalid'));
  console.log('- Database Sync: ' + (dbInSync ? '✅ In sync' : '⚠️ Needs migration'));
  
  if (dbInSync) {
    console.log('\n✅ All checks passed! The database is in sync with your Prisma schema.');
  } else {
    console.log('\n⚠️ Migration required. Run "npx prisma migrate dev" to update your database.');
  }
}

main().catch(e => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
