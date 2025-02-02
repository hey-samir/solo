-- Drop existing tables (will be recreated with proper structure)
DROP TABLE IF EXISTS "climb";
DROP TABLE IF EXISTS "route";
DROP TABLE IF EXISTS "feedback";
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS "gym";

-- Create new tables with consistent naming and structure
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "name" TEXT,
  "profile_photo" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "member_since" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "gym_id" INTEGER,
  "user_type" TEXT NOT NULL DEFAULT 'user' CHECK (user_type IN ('demo', 'user', 'admin'))
);

CREATE TABLE IF NOT EXISTS "gyms" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key after gyms table exists
ALTER TABLE "users" ADD CONSTRAINT "users_gym_id_fkey" 
  FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS "points" (
  "id" SERIAL PRIMARY KEY,
  "grade" TEXT NOT NULL UNIQUE,
  "points" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "routes" (
  "id" SERIAL PRIMARY KEY,
  "gym_id" INTEGER NOT NULL REFERENCES "gyms"("id"),
  "color" TEXT NOT NULL,
  "grade" TEXT NOT NULL,
  "wall_sector" TEXT NOT NULL,
  "anchor_number" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "sends" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "route_id" INTEGER NOT NULL REFERENCES "routes"("id"),
  "status" BOOLEAN NOT NULL DEFAULT false,
  "tries" INTEGER NOT NULL DEFAULT 1,
  "points" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "feedback" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "screenshot_url" TEXT,
  "upvotes" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_routes_gym_id" ON "routes"("gym_id");
CREATE INDEX IF NOT EXISTS "idx_sends_user_id" ON "sends"("user_id");
CREATE INDEX IF NOT EXISTS "idx_sends_route_id" ON "sends"("route_id");
CREATE INDEX IF NOT EXISTS "idx_feedback_user_id" ON "feedback"("user_id");

-- Insert default point values
INSERT INTO "points" ("grade", "points") VALUES
('5.6', 10),
('5.7', 20),
('5.8', 30),
('5.9', 40),
('5.10a', 50),
('5.10b', 60),
('5.10c', 70),
('5.10d', 80),
('5.11a', 90),
('5.11b', 100),
('5.11c', 110),
('5.11d', 120),
('5.12a', 130);
