"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// Convert database user to API response format
const formatUserResponse = (user) => ({
    id: user.id,
    username: user.username,
    displayName: user.name,
    email: user.email,
    profilePhoto: user.profile_photo,
    memberSince: user.member_since.toISOString(),
    createdAt: user.created_at.toISOString(),
    gym: user.gym ? {
        id: user.gym.id,
        name: user.gym.name
    } : null
});
// Get user by username
const getUserByUsername = async (req, res, next) => {
    try {
        const username = req.params.username;
        // Remove @ if present
        const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.username, cleanUsername),
            with: {
                gym: true
            }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(formatUserResponse(user));
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// Get current user route
router.get('/current', async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, req.user.id),
            with: {
                gym: true
            }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json(formatUserResponse(user));
    }
    catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get user by username
router.get('/:username', getUserByUsername);
exports.default = router;
//# sourceMappingURL=user.js.map