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
    console.log("Applying migrations...");
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migrations completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

main();
