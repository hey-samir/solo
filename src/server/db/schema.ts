const { pgTable, serial, text, timestamp, integer, boolean } = require('drizzle-orm/pg-core');

interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  profilePhoto?: string;
  memberSince: Date;
  gymId?: number;
}

interface Route {
  id: number;
  routeId: string;
  color?: string;
  grade?: string;
  rating?: number;
  dateSet?: Date;
  gymId: number;
}

interface Climb {
  id: number;
  userId: number;
  routeId: number;
  status?: boolean;
  rating?: number;
  tries?: number;
  notes?: string;
  points?: number;
  createdAt: Date;
}

const users = pgTable('user', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  profilePhoto: text('profile_photo'),
  memberSince: timestamp('member_since').defaultNow(),
  gymId: integer('gym_id')
});

const routes = pgTable('route', {
  id: serial('id').primaryKey(),
  routeId: text('route_id').notNull(),
  color: text('color'),
  grade: text('grade'),
  rating: integer('rating'),
  dateSet: timestamp('date_set'),
  gymId: integer('gym_id').notNull()
});

const climbs = pgTable('climb', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  routeId: integer('route_id').notNull(),
  status: boolean('status'),
  rating: integer('rating'),
  tries: integer('tries'),
  notes: text('notes'),
  points: integer('points'),
  createdAt: timestamp('created_at').defaultNow()
});

module.exports = {
  users,
  routes,
  climbs
};