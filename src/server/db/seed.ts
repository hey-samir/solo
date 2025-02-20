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
  sends: [
    {
      user_id: 1,  // Changed from userId to user_id to match schema
      route_id: 1, // Added required route_id
      status: true, // Added required status
      tries: 3,    // Changed from attempts to tries
      points: 100, // Added required points
      notes: "Clean send after working the beta",
      created_at: new Date('2025-02-01')
    },
    {
      user_id: 1,
      route_id: 2,
      status: false,
      tries: 1,
      points: 50,
      notes: "Project for next session",
      created_at: new Date('2025-02-05')
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
      const demoUser = await db.insert(schema.users).values({
        username: "demouser",
        email: "demo@example.com",
        password_hash: "$2a$10$demopasswordhash", // Add required password_hash
        created_at: new Date(),
        member_since: new Date(),
        user_type: "user"
      }).onConflictDoNothing();

      // Create demo gym
      const demoGym = await db.insert(schema.gyms).values({
        name: "Movement Gowanus",
        location: "Brooklyn, NY",
        created_at: new Date()
      }).onConflictDoNothing();

      // Create demo routes
      await db.insert(schema.routes).values([
        {
          gym_id: 1,
          color: "Blue",
          grade: "5.11a",
          wall_sector: "Main Wall",
          anchor_number: 1,
          active: true,
          created_at: new Date()
        },
        {
          gym_id: 1,
          color: "Red",
          grade: "5.10c",
          wall_sector: "Cave",
          anchor_number: 2,
          active: true,
          created_at: new Date()
        }
      ]).onConflictDoNothing();

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