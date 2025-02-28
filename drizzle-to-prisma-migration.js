/**
 * Drizzle to Prisma Migration Utility
 * 
 * This script helps analyze existing Drizzle migrations and convert them to Prisma migrations.
 * It reads Drizzle migration files and outputs SQL that can be used in Prisma migrations.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DRIZZLE_MIGRATIONS_DIR = './drizzle/migrations';
const OUTPUT_DIR = './prisma/migrations/analysis';

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read all Drizzle migration files
function readDrizzleMigrations() {
  if (!fs.existsSync(DRIZZLE_MIGRATIONS_DIR)) {
    console.error(`Error: Drizzle migrations directory not found at ${DRIZZLE_MIGRATIONS_DIR}`);
    return [];
  }

  const migrationFiles = fs.readdirSync(DRIZZLE_MIGRATIONS_DIR)
    .filter(file => file.endsWith('.ts') && !file.startsWith('meta'))
    .sort(); // Sort to process in order

  console.log(`Found ${migrationFiles.length} Drizzle migration files`);
  
  return migrationFiles.map(file => {
    const filePath = path.join(DRIZZLE_MIGRATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    return { 
      name: file,
      content,
      path: filePath
    };
  });
}

// Extract the SQL up/down migrations
function extractSqlFromMigration(content) {
  // Basic regex to find SQL in up/down functions
  const upMatch = content.match(/up\s*\(\s*db\s*\)\s*{([\s\S]*?)}/);
  const downMatch = content.match(/down\s*\(\s*db\s*\)\s*{([\s\S]*?)}/);

  const upContent = upMatch ? upMatch[1].trim() : '';
  const downContent = downMatch ? downMatch[1].trim() : '';

  // Extract SQL statements from db.execute calls
  const extractSql = (content) => {
    const statements = [];
    const regex = /db\.execute\((['"`])([\s\S]*?)\1\)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      statements.push(match[2]);
    }
    
    return statements;
  };

  return {
    up: extractSql(upContent),
    down: extractSql(downContent)
  };
}

// Write the analysis to output files
function writeAnalysis(migrations) {
  const summaryFile = path.join(OUTPUT_DIR, 'migration_summary.md');
  let summary = '# Drizzle Migration Analysis\n\n';
  
  migrations.forEach((migration, index) => {
    const { name, sql } = migration;
    
    // Write individual migration file
    const outputFile = path.join(OUTPUT_DIR, `${name.replace('.ts', '')}_analysis.sql`);
    let content = `-- Migration: ${name}\n\n`;
    
    content += '-- UP Migration SQL:\n';
    if (sql.up.length > 0) {
      sql.up.forEach(stmt => {
        content += `${stmt}\n`;
      });
    } else {
      content += '-- No SQL statements found\n';
    }
    
    content += '\n-- DOWN Migration SQL:\n';
    if (sql.down.length > 0) {
      sql.down.forEach(stmt => {
        content += `${stmt}\n`;
      });
    } else {
      content += '-- No SQL statements found\n';
    }
    
    fs.writeFileSync(outputFile, content);
    
    // Add to summary
    summary += `## ${index + 1}. ${name}\n\n`;
    summary += `- Up migrations: ${sql.up.length}\n`;
    summary += `- Down migrations: ${sql.down.length}\n\n`;
  });
  
  fs.writeFileSync(summaryFile, summary);
  console.log(`Migration analysis written to ${OUTPUT_DIR}`);
}

// Main function
function main() {
  console.log('Starting Drizzle to Prisma migration analysis...');
  
  const migrations = readDrizzleMigrations();
  if (migrations.length === 0) {
    console.log('No migrations to process. Exiting.');
    return;
  }
  
  const processedMigrations = migrations.map(migration => {
    console.log(`Processing migration: ${migration.name}`);
    const sql = extractSqlFromMigration(migration.content);
    return {
      ...migration,
      sql
    };
  });
  
  writeAnalysis(processedMigrations);
  
  console.log('Migration analysis complete!');
  console.log(`Check ${OUTPUT_DIR} for the results.`);
}

main();
