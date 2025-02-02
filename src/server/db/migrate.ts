import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const runMigration = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('Starting migration process...');

  try {
    // Ensure drizzle directory exists
    const drizzleDir = path.join(process.cwd(), 'drizzle');
    if (!fs.existsSync(drizzleDir)) {
      fs.mkdirSync(drizzleDir);
    }

    // Ensure meta directory exists
    const metaDir = path.join(drizzleDir, 'meta');
    if (!fs.existsSync(metaDir)) {
      fs.mkdirSync(metaDir);
    }

    // Create _journal.json if it doesn't exist
    const journalPath = path.join(metaDir, '_journal.json');
    if (!fs.existsSync(journalPath)) {
      fs.writeFileSync(journalPath, JSON.stringify({ entries: [] }));
    }

    const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });
    const db = drizzle(migrationClient);

    console.log('Running migrations...');

    await migrate(db, {
      migrationsFolder: 'drizzle'
    });

    console.log('Migrations completed successfully');

    await migrationClient.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();