import { drizzle } from "drizzle-orm/vercel-postgres";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import { sql, createClient } from "@vercel/postgres";
import * as schema from "./schema";
import * as fs from 'fs';
import * as path from 'path';

// Enable debug logging
console.log("Starting database migration process...");

// Get connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Configure database client with explicit config for migrations
const client = createClient({
  connectionString,
  ssl: { rejectUnauthorized: false },
  // For migrations, we want a direct connection
  poolConfig: {
    maxPoolSize: 1,
    connectionTimeoutMillis: 30000
  }
});

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

    // Verify database connection and schema
    const result = await client.query('SELECT current_database(), current_schema();');
    console.log("Connected to database:", result.rows[0]);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    console.error("Migration stack trace:", error.stack);
    await client.end().catch(console.error);
    process.exit(1);
  }
}

// Add process error handlers
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await client.end().catch(console.error);
  process.exit(1);
});

process.on('uncaughtException', async error => {
  console.error('Uncaught Exception:', error);
  await client.end().catch(console.error);
  process.exit(1);
});

main();