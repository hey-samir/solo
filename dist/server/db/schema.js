"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedback = exports.sends = exports.routes = exports.points = exports.users = exports.gyms = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.gyms = (0, pg_core_1.pgTable)('gyms', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    location: (0, pg_core_1.text)('location').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    username: (0, pg_core_1.text)('username').notNull().unique(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    password_hash: (0, pg_core_1.text)('password_hash').notNull(),
    name: (0, pg_core_1.text)('name'),
    profile_photo: (0, pg_core_1.text)('profile_photo'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    member_since: (0, pg_core_1.timestamp)('member_since').defaultNow(),
    gym_id: (0, pg_core_1.integer)('gym_id').references(() => exports.gyms.id),
    user_type: (0, pg_core_1.text)('user_type').notNull().default('user')
});
exports.points = (0, pg_core_1.pgTable)('points', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    grade: (0, pg_core_1.text)('grade').notNull().unique(),
    points: (0, pg_core_1.integer)('points').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
exports.routes = (0, pg_core_1.pgTable)('routes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    gym_id: (0, pg_core_1.integer)('gym_id').notNull().references(() => exports.gyms.id),
    color: (0, pg_core_1.text)('color').notNull(),
    grade: (0, pg_core_1.text)('grade').notNull(),
    wall_sector: (0, pg_core_1.text)('wall_sector').notNull(),
    anchor_number: (0, pg_core_1.integer)('anchor_number'),
    active: (0, pg_core_1.boolean)('active').notNull().default(true),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
exports.sends = (0, pg_core_1.pgTable)('sends', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    user_id: (0, pg_core_1.integer)('user_id').notNull().references(() => exports.users.id),
    route_id: (0, pg_core_1.integer)('route_id').notNull().references(() => exports.routes.id),
    status: (0, pg_core_1.boolean)('status').notNull().default(false),
    tries: (0, pg_core_1.integer)('tries').notNull().default(1),
    points: (0, pg_core_1.integer)('points').notNull().default(0),
    notes: (0, pg_core_1.text)('notes'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
exports.feedback = (0, pg_core_1.pgTable)('feedback', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    user_id: (0, pg_core_1.integer)('user_id').notNull().references(() => exports.users.id),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    category: (0, pg_core_1.text)('category').notNull(),
    screenshot_url: (0, pg_core_1.text)('screenshot_url'),
    upvotes: (0, pg_core_1.integer)('upvotes').notNull().default(0),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow()
});
// Export all tables
exports.default = {
    gyms: exports.gyms,
    users: exports.users,
    points: exports.points,
    routes: exports.routes,
    sends: exports.sends,
    feedback: exports.feedback
};
