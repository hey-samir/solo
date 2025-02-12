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

console.log("Using database URL:", connectionString.replace(/:[^:]+@/, ':****@'));

const client = createClient({ connectionString });
const db = drizzle(client, { schema });

// Demo data for staging environment
const demoData = {
  sessions: [
    {
      date: new Date('2025-02-01'),
      duration: 120,
      routesClimbed: 15,
      averageGrade: "V4",
      userId: "demouser"
    },
    {
      date: new Date('2025-02-05'),
      duration: 90,
      routesClimbed: 12,
      averageGrade: "V3",
      userId: "demouser"
    },
    {
      date: new Date('2025-02-10'),
      duration: 150,
      routesClimbed: 20,
      averageGrade: "V4",
      userId: "demouser"
    }
  ],
  sends: [
    {
      grade: "V4",
      attempts: 3,
      date: new Date('2025-02-01'),
      userId: "demouser",
      sessionId: 1
    },
    {
      grade: "V3",
      attempts: 1,
      date: new Date('2025-02-05'),
      userId: "demouser",
      sessionId: 2
    }
  ]
};

async function seed() {
  console.log("Starting seed process...");

  try {
    await client.connect();
    console.log("Successfully connected to database");

    if (process.env.NODE_ENV === 'staging') {
      console.log("Seeding demo data for staging environment...");

      // Create demo user if it doesn't exist
      await db.insert(schema.users).values({
        id: "demouser",
        username: "demouser",
        email: "demo@example.com",
        createdAt: new Date()
      }).onConflictDoNothing();

      // Insert sessions
      for (const session of demoData.sessions) {
        await db.insert(schema.sessions).values(session).onConflictDoNothing();
      }

      // Insert sends
      for (const send of demoData.sends) {
        await db.insert(schema.sends).values(send).onConflictDoNothing();
      }

      console.log("Demo data seeded successfully");
    }

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