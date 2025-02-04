"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get user stats
router.get('/me/stats', auth_1.isAuthenticated, async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                error: 'Please log in to view your climbing statistics.',
                details: 'Authentication required'
            });
            return;
        }
        const stats = await db_1.db.select({
            totalAscents: (0, drizzle_orm_1.sql) `count(*)`.mapWith(Number),
            totalSends: (0, drizzle_orm_1.sql) `sum(case when ${schema_1.sends.status} = true then 1 else 0 end)`.mapWith(Number),
            totalPoints: (0, drizzle_orm_1.sql) `sum(${schema_1.sends.points})`.mapWith(Number),
            avgGrade: (0, drizzle_orm_1.sql) `mode() within group (order by ${schema_1.routes.grade})`.mapWith(String),
            avgSentGrade: (0, drizzle_orm_1.sql) `mode() within group (order by case when ${schema_1.sends.status} = true then ${schema_1.routes.grade} end)`.mapWith(String),
            avgPointsPerClimb: (0, drizzle_orm_1.sql) `round(avg(${schema_1.sends.points})::numeric, 1)`.mapWith(Number),
            successRate: (0, drizzle_orm_1.sql) `round(sum(case when ${schema_1.sends.status} = true then 100 else 0 end)::numeric / count(*)::numeric, 1)`.mapWith(Number),
            successRatePerSession: (0, drizzle_orm_1.sql) `round(avg(case when ${schema_1.sends.status} = true then 100 else 0 end)::numeric, 1)`.mapWith(Number),
            climbsPerSession: (0, drizzle_orm_1.sql) `round(count(*)::numeric / count(distinct date_trunc('day', ${schema_1.sends.created_at}))::numeric, 1)`.mapWith(Number),
            avgAttemptsPerClimb: (0, drizzle_orm_1.sql) `round(avg(${schema_1.sends.tries})::numeric, 1)`.mapWith(Number)
        })
            .from(schema_1.sends)
            .leftJoin(schema_1.routes, (0, drizzle_orm_1.eq)(schema_1.sends.route_id, schema_1.routes.id))
            .where((0, drizzle_orm_1.eq)(schema_1.sends.user_id, req.user.id));
        res.json(stats[0]);
    }
    catch (error) {
        console.error('[Stats API] Error:', error);
        res.status(500).json({
            error: 'Unable to load your climbing statistics. Please try again later.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get user profile
router.get('/profile', auth_1.isAuthenticated, async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                error: 'Please log in to view your profile.',
                details: 'Authentication required'
            });
            return;
        }
        const [userProfile] = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, req.user.id))
            .limit(1);
        if (!userProfile) {
            res.status(404).json({
                error: 'Profile not found.',
                details: 'User profile could not be located'
            });
            return;
        }
        res.json({
            id: userProfile.id,
            username: userProfile.username,
            email: userProfile.email,
            name: userProfile.name,
            profilePhoto: userProfile.profile_photo,
            memberSince: userProfile.member_since,
            gymId: userProfile.gym_id,
            userType: userProfile.user_type
        });
    }
    catch (error) {
        console.error('[Profile API] Error:', error);
        res.status(500).json({
            error: 'Unable to load your profile. Please try again later.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map