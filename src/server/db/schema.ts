import { serial, text, timestamp, integer, boolean, pgTable } from 'drizzle-orm/pg-core';
import { InferModel } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  name: text('name'),
  profile_photo: text('profile_photo'),
  created_at: timestamp('created_at').defaultNow(),
  member_since: timestamp('member_since').defaultNow(),
  gym_id: integer('gym_id'),
  user_type: text('user_type').notNull().default('user')
});

export const gyms = pgTable('gyms', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  location: text('location').notNull(),
  created_at: timestamp('created_at').defaultNow()
});

export const points = pgTable('points', {
  id: serial('id').primaryKey(),
  grade: text('grade').notNull().unique(),
  points: integer('points').notNull(),
  tried_points: integer('tried_points').notNull(), 
  created_at: timestamp('created_at').defaultNow()
});

export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  gym_id: integer('gym_id').notNull().references(() => gyms.id),
  color: text('color').notNull(),
  grade: text('grade').notNull(),
  wall_sector: text('wall_sector').notNull(),
  anchor_number: integer('anchor_number'),
  active: boolean('active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow()
});

export const sends = pgTable('sends', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  route_id: integer('route_id').notNull().references(() => routes.id),
  status: boolean('status').notNull().default(false),
  tries: integer('tries').notNull().default(1),
  points: integer('points').notNull().default(0),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow()
});

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  screenshot_url: text('screenshot_url'),
  upvotes: integer('upvotes').notNull().default(0),
  created_at: timestamp('created_at').defaultNow()
});

// Define types for TypeScript
export type User = InferModel<typeof users>;
export type Gym = InferModel<typeof gyms>;
export type Point = InferModel<typeof points>;
export type Route = InferModel<typeof routes>;
export type Send = InferModel<typeof sends>;
export type Feedback = InferModel<typeof feedback>;