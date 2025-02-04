"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
// Will be replaced by actual credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Passport Google OAuth strategy setup
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://gosolo.nyc/auth/google/callback'
        : 'http://localhost:5000/auth/google/callback',
    scope: ['profile', 'email']
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        console.log('Google OAuth callback:', { profile_id: profile.id });
        // Check if user exists
        const existingUser = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, profile.emails?.[0].value))
            .limit(1);
        if (existingUser.length > 0) {
            console.log('Existing user found:', existingUser[0].id);
            return done(null, existingUser[0]);
        }
        // Create new user if doesn't exist
        const [newUser] = await db_1.db
            .insert(schema_1.users)
            .values({
            username: profile.displayName,
            name: profile.displayName,
            email: profile.emails?.[0].value,
            profile_photo: profile.photos?.[0].value,
            password_hash: '', // Google auth doesn't need password
            created_at: new Date(),
            member_since: new Date(),
            user_type: 'user'
        })
            .returning();
        console.log('New user created:', newUser.id);
        return done(null, newUser);
    }
    catch (error) {
        console.error('OAuth error:', error);
        return done(error);
    }
}));
// Serialize user for the session
passport_1.default.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
});
// Deserialize user from the session
passport_1.default.deserializeUser(async (id, done) => {
    try {
        console.log('Deserializing user:', id);
        const [user] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
            .limit(1);
        if (!user) {
            console.error('User not found during deserialization:', id);
            return done(null, false);
        }
        done(null, user);
    }
    catch (error) {
        console.error('Deserialization error:', error);
        done(error);
    }
});
// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    console.log('Auth check:', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user?.id,
        sessionID: req.sessionID
    });
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};
exports.isAuthenticated = isAuthenticated;
exports.default = passport_1.default;
