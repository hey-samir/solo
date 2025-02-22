import { drizzle } from "drizzle-orm/vercel-postgres";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";

// Enable debug logging
console.log("Starting database migration process...");

// Get connection string from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Configure database client
const client = sql.createClient({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const db = drizzle(client, { schema });

async function main() {
  console.log("Connecting to database...");
  console.log("Using connection string:", connectionString.replace(/:[^:@]*@/, ':****@'));

  try {
    // Apply migrations
    console.log("Applying migrations...");
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log("Migrations completed successfully");

    // Verify database connection
    const result = await client.query('SELECT current_database(), current_schema();');
    console.log("Connected to database:", result.rows[0]);

    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    console.error("Migration stack trace:", error.stack);
    process.exit(1);
  }
}

// Add process error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

main();