import { drizzle } from "drizzle-orm/vercel-postgres";
import { createClient } from "@vercel/postgres";
import * as schema from "./schema";

// Enable debug logging
console.log("Starting database seed process...");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const client = createClient({ connectionString });
const db = drizzle(client, { schema });

async function seed() {
  console.log("Starting seed process...");

  try {
    await client.connect();

    // Add test data once schema is defined
    console.log("Seed completed successfully");

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error("Error during seed:", error);
    console.error("Seed error stack trace:", error.stack);
    await client.end();
    process.exit(1);
  }
}

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

seed();