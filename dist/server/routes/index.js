"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = __importDefault(require("./user.routes"));
const climb_routes_1 = __importDefault(require("./climb.routes"));
const session_routes_1 = __importDefault(require("./session.routes"));
const routes_1 = __importDefault(require("./routes"));
const feedback_routes_1 = __importDefault(require("./feedback.routes"));
const auth_1 = __importDefault(require("./auth"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// Health check route
router.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Mount feature routes
router.use('/auth', auth_1.default);
router.use('/user', user_routes_1.default);
router.use('/routes', routes_1.default);
router.use('/climbs', climb_routes_1.default);
router.use('/sessions', session_routes_1.default);
router.use('/feedback', feedback_routes_1.default);
// Leaderboard endpoint
router.get('/leaderboard', async (req, res) => {
    try {
        const results = await db_1.db
            .select({
            user_id: schema_1.users.id,
            username: schema_1.users.username,
            total_sends: (0, drizzle_orm_1.sql) `COALESCE(count(case when ${schema_1.sends.status} = true then 1 end), 0)`.mapWith(Number),
            total_points: (0, drizzle_orm_1.sql) `COALESCE(sum(${schema_1.sends.points}), 0)`.mapWith(Number)
        })
            .from(schema_1.users)
            .leftJoin(schema_1.sends, (0, drizzle_orm_1.sql) `${schema_1.sends.user_id} = ${schema_1.users.id}`)
            .groupBy(schema_1.users.id, schema_1.users.username)
            .orderBy((0, drizzle_orm_1.sql) `COALESCE(sum(${schema_1.sends.points}), 0) desc`);
        const leaderboardData = results.map((entry) => ({
            id: entry.user_id,
            username: entry.username || 'Unknown User',
            totalSends: Number(entry.total_sends) || 0,
            totalPoints: Number(entry.total_points) || 0
        }));
        res.json(leaderboardData);
    }
    catch (error) {
        console.error('[Leaderboard API] Error:', error);
        res.status(500).json({
            error: 'Failed to fetch leaderboard',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
