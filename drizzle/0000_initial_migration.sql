CREATE TABLE IF NOT EXISTS "user" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "name" TEXT,
  "profile_photo" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "member_since" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "gym_id" INTEGER REFERENCES "gym"("id"),
  "user_type" TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS "gym" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "route" (
  "id" SERIAL PRIMARY KEY,
  "route_id" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "grade" TEXT NOT NULL,
  "grade_id" INTEGER NOT NULL,
  "routesetter" TEXT,
  "date_set" TIMESTAMP NOT NULL,
  "gym_id" INTEGER NOT NULL REFERENCES "gym"("id"),
  "wall_sector" TEXT NOT NULL,
  "route_type" TEXT NOT NULL,
  "height_meters" INTEGER,
  "active" BOOLEAN,
  "anchor_number" INTEGER,
  "hold_style" TEXT,
  "avg_stars" INTEGER,
  "stars_count" INTEGER,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "climb" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "user"("id"),
  "route_id" INTEGER NOT NULL REFERENCES "route"("id"),
  "status" BOOLEAN NOT NULL,
  "rating" INTEGER NOT NULL,
  "tries" INTEGER NOT NULL,
  "notes" TEXT,
  "points" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "feedback" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "screenshot_url" TEXT,
  "user_id" INTEGER NOT NULL REFERENCES "user"("id"),
  "upvotes" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create meta/_journal.json for migration tracking
DO $$ 
BEGIN
  CREATE TABLE IF NOT EXISTS "_journal" (
    "id" SERIAL PRIMARY KEY,
    "tag" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Insert initial migration record
  INSERT INTO "_journal" ("tag", "version") 
  VALUES ('initial', '0000_initial_migration')
  ON CONFLICT DO NOTHING;
END $$;
