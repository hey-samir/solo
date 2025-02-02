CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  password_hash TEXT,
  profile_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  gym_id INTEGER,
  user_type VARCHAR(10) DEFAULT 'user' CHECK (user_type IN ('demo', 'user', 'admin'))
);

CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  color VARCHAR(50) NOT NULL,
  grade VARCHAR(10) NOT NULL,
  wall_sector VARCHAR(50) NOT NULL,
  anchor_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  gym_id INTEGER
);

CREATE TABLE IF NOT EXISTS climbs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  route_id INTEGER REFERENCES routes(id) NOT NULL,
  status BOOLEAN NOT NULL DEFAULT false,
  tries INTEGER NOT NULL DEFAULT 1,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_climbs_user_id ON climbs(user_id);
CREATE INDEX IF NOT EXISTS idx_climbs_route_id ON climbs(route_id);
CREATE INDEX IF NOT EXISTS idx_climbs_created_at ON climbs(created_at);
