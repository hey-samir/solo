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
  name: string | null;
  profile_photo: string | null;
  created_at: Date;
  member_since: Date;
  gym_id: number | null;
  user_type: 'demo' | 'user' | 'admin';
}

export interface Route {
  id: number;
  color: string;
  grade: string;
  wall_sector: string;
  anchor_number: number;
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

export interface Feedback {
  id: number;
  title: string;
  description: string;
  category: string;
  screenshot_url?: string;
  user_id: number;
  upvotes: number;
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
  user_type: text('user_type').notNull().default('user'),
});

export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  color: text('color').notNull(),
  grade: text('grade').notNull(),
  wall_sector: text('wall_sector').notNull(),
  anchor_number: integer('anchor_number').notNull(),
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

export const feedbacks = pgTable('feedback', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  screenshot_url: text('screenshot_url'),
  user_id: integer('user_id').notNull().references(() => users.id),
  upvotes: integer('upvotes').notNull().default(0),
  created_at: timestamp('created_at').defaultNow()
});


export default {
  gyms,
  users,
  routes,
  climbs,
  feedbacks
};