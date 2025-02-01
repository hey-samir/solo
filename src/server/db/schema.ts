import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  profilePhoto?: string;
  memberSince: Date;
  gymId?: number;
}

export interface Route {
  id: number;
  routeId: string;
  color: string;
  grade: string;
  rating: number;
  dateSet: Date;
  gymId: number;
}

export interface Climb {
  id: number;
  userId: number;
  routeId: number;
  status: boolean;
  rating: number;
  tries: number;
  notes: string | null;
  points: number;
  createdAt: Date;
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  profilePhoto: text('profile_photo'),
  memberSince: timestamp('member_since').defaultNow(),
  gymId: integer('gym_id')
});

export const routes = pgTable('routes', {
  id: serial('id').primaryKey(),
  routeId: text('route_id').notNull(),
  color: text('color').notNull(),
  grade: text('grade').notNull(),
  rating: integer('rating').notNull(),
  dateSet: timestamp('date_set').notNull(),
  gymId: integer('gym_id').notNull()
});

export const climbs = pgTable('climbs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  routeId: integer('route_id').notNull(),
  status: boolean('status').notNull(),
  rating: integer('rating').notNull(),
  tries: integer('tries').notNull(),
  notes: text('notes'),
  points: integer('points').notNull(),
  createdAt: timestamp('created_at').defaultNow()
});

export default {
  users,
  routes,
  climbs
};