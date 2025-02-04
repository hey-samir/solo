import { drizzle } from "drizzle-orm/vercel-postgres";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";

// Enable debug logging
console.log("Starting database migration process...");

const db = drizzle(sql, { schema });

async function main() {
  console.log("Connecting to database...");

  try {
    console.log("Creating migrations directory if it doesn't exist...");
    const fs = require('fs');
    const path = require('path');
    const migrationsDir = path.join(process.cwd(), 'drizzle');

    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log("Created migrations directory:", migrationsDir);
    }

    console.log("Applying migrations...");
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log("Migrations completed successfully");

    // Verify database connection and schema
    const result = await sql`SELECT current_database()`;
    console.log("Connected to database:", result[0].current_database);

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