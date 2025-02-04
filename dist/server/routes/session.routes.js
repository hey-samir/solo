"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all sessions with proper error handling
router.get('/', auth_1.isAuthenticated, async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                error: 'Please log in to view your climbing sessions.',
                details: 'Authentication required'
            });
            return;
        }
        const sessions = await db_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.sends.created_at})::date`.mapWith(String),
            total_climbs: (0, drizzle_orm_1.sql) `count(*)`.mapWith(Number),
            total_sends: (0, drizzle_orm_1.sql) `sum(case when ${schema_1.sends.status} = true then 1 else 0 end)`.mapWith(Number),
            total_points: (0, drizzle_orm_1.sql) `sum(${schema_1.sends.points})`.mapWith(Number),
            avg_grade: (0, drizzle_orm_1.sql) `mode() within group (order by ${schema_1.routes.grade})`.mapWith(String),
            duration: (0, drizzle_orm_1.sql) `extract(epoch from (max(${schema_1.sends.created_at}) - min(${schema_1.sends.created_at})))/3600`.mapWith(Number),
            grades: (0, drizzle_orm_1.sql) `array_agg(distinct ${schema_1.routes.grade} order by ${schema_1.routes.grade})`.mapWith(String),
            success_rate: (0, drizzle_orm_1.sql) `round(sum(case when ${schema_1.sends.status} = true then 100 else 0 end)::numeric / count(*)::numeric, 1)`.mapWith(Number)
        })
            .from(schema_1.sends)
            .leftJoin(schema_1.routes, (0, drizzle_orm_1.eq)(schema_1.sends.route_id, schema_1.routes.id))
            .where((0, drizzle_orm_1.eq)(schema_1.sends.user_id, req.user.id))
            .groupBy((0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.sends.created_at})::date`)
            .orderBy((0, drizzle_orm_1.sql) `date_trunc('day', ${schema_1.sends.created_at})::date desc`);
        const formattedSessions = sessions.map(session => ({
            id: session.date,
            userId: req.user?.id,
            duration: Math.round(session.duration || 0),
            location: 'Main Gym',
            totalClimbs: session.total_climbs,
            totalSends: session.total_sends,
            totalPoints: session.total_points,
            avgGrade: session.avg_grade,
            grades: session.grades,
            successRate: session.success_rate,
            createdAt: session.date
        }));
        res.json(formattedSessions);
    }
    catch (error) {
        console.error('[Sessions API] Error fetching sessions:', error);
        res.status(500).json({
            error: 'Unable to load your climbing sessions. Please try again later.',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=session.routes.js.map