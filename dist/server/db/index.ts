import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import schema from './schema';

// Define database configuration type
interface DatabaseConfig {
  max: number;
  idle_timeout: number;
  connect_timeout: number;
}

// Use the DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Database configuration
const config: DatabaseConfig = {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10
};

// Create the connection
const client = postgres(connectionString, config);

// Create the database instance
const db = drizzle(client, { schema });

export { db };
export type { DatabaseConfig };