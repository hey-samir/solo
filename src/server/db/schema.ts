import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export interface Gym {
  id: number;
  name: string;
  location: string;
  created_at: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name?: string;
  profile_photo?: string;
  created_at: Date;
  member_since: Date;
  gym_id?: number;
  user_type: 'demo' | 'user' | 'admin';
}

export interface Route {
  id: number;
  route_id: string;
  color: string;
  grade: string;
  grade_id: number;
  routesetter?: string;
  date_set: Date;
  gym_id: number;
  wall_sector: string;
  route_type: string;
  height_meters?: number;
  active?: boolean;
  anchor_number?: number;
  hold_style?: string;
  avg_stars?: number;
  stars_count?: number;
  created_at: Date;
}

export interface Climb {
  id: number;
  user_id: number;
  route_id: number;
  status: boolean;
  rating: number;
  tries: number;
  notes: string | null;
  points: number;
  created_at: Date;
}

export const gyms = pgTable('gym', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  created_at: timestamp('created_at').defaultNow()
});

export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  name: text('name'),
  profile_photo: text('profile_photo'),
  created_at: timestamp('created_at').defaultNow(),
  member_since: timestamp('member_since').defaultNow(),
  gym_id: integer('gym_id').references(() => gyms.id),
});

export const routes = pgTable('route', {
  id: serial('id').primaryKey(),
  route_id: text('route_id').notNull(),
  color: text('color').notNull(),
  grade: text('grade').notNull(),
  grade_id: integer('grade_id').notNull(),
  routesetter: text('routesetter'),
  date_set: timestamp('date_set').notNull(),
  gym_id: integer('gym_id').notNull().references(() => gyms.id),
  wall_sector: text('wall_sector').notNull(),
  route_type: text('route_type').notNull(),
  height_meters: integer('height_meters'),
  active: boolean('active'),
  anchor_number: integer('anchor_number'),
  hold_style: text('hold_style'),
  avg_stars: integer('avg_stars'),
  stars_count: integer('stars_count'),
  created_at: timestamp('created_at').defaultNow()
});

export const climbs = pgTable('climb', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  route_id: integer('route_id').notNull().references(() => routes.id),
  status: boolean('status').notNull(),
  rating: integer('rating').notNull(),
  tries: integer('tries').notNull(),
  notes: text('notes'),
  points: integer('points').notNull(),
  created_at: timestamp('created_at').defaultNow()
});

export default {
  gyms,
  users,
  routes,
  climbs
};