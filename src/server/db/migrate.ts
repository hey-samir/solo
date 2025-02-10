import { drizzle } from "drizzle-orm/vercel-postgres";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import { sql, createClient } from "@vercel/postgres";
import * as schema from "./schema";
import * as fs from 'fs';
import * as path from 'path';

// Enable debug logging
console.log("Starting database migration process...");

// Get connection string from environment variables
let connectionString = process.env.DATABASE_URL;

// If DATABASE_URL is not set, construct it from individual variables
if (!connectionString) {
  const {
    PGUSER,
    PGPASSWORD,
    PGHOST,
    PGPORT,
    PGDATABASE
  } = process.env;

  if (PGUSER && PGPASSWORD && PGHOST && PGPORT && PGDATABASE) {
    connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?sslmode=require`;
    console.log("Created connection string from individual variables");
  } else {
    console.error("Neither DATABASE_URL nor individual Postgres variables are set");
    process.exit(1);
  }
}

// Set POSTGRES_URL for Vercel client compatibility
process.env.POSTGRES_URL = connectionString;

// Configure database with connection string using createClient for direct connection
const client = createClient();
const db = drizzle(client, { schema });

async function main() {
  console.log("Connecting to database...");
  // Hide sensitive info in logs
  console.log("Using connection string:", connectionString.replace(/:[^:@]*@/, ':****@'));

  try {
    // Connect the client
    await client.connect();

    // Ensure migrations directory structure exists
    const migrationsDir = path.join(process.cwd(), 'drizzle/migrations');
    const metaDir = path.join(migrationsDir, 'meta');

    console.log("Creating directory structure...");
    fs.mkdirSync(migrationsDir, { recursive: true });
    fs.mkdirSync(metaDir, { recursive: true });

    // Create meta journal if it doesn't exist
    const journalPath = path.join(metaDir, '_journal.json');
    if (!fs.existsSync(journalPath)) {
      console.log("Creating meta journal...");
      const initialJournal = {
        version: "5",
        dialect: "pg",
        entries: []
      };
      fs.writeFileSync(journalPath, JSON.stringify(initialJournal, null, 2));
    }

    console.log("Applying migrations...");
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log("Migrations completed successfully");

    // Verify database connection
    const result = await sql`SELECT current_database()`;
    console.log("Connected to database:", result.rows[0].current_database);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    console.error("Migration stack trace:", error.stack);
    await client.end();
    process.exit(1);
  }
}

// Add process error handlers
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await client.end();
  process.exit(1);
});

process.on('uncaughtException', async error => {
  console.error('Uncaught Exception:', error);
  await client.end();
  process.exit(1);
});

main();