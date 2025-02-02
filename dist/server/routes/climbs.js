"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const getUserClimbs = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const userClimbs = await db_1.db
            .select({
            id: schema_1.climbs.id,
            route_id: schema_1.climbs.route_id,
            status: schema_1.climbs.status,
            rating: schema_1.climbs.rating,
            tries: schema_1.climbs.tries,
            notes: schema_1.climbs.notes,
            points: schema_1.climbs.points,
            created_at: schema_1.climbs.created_at,
            route: {
                color: schema_1.routes.color,
                grade: schema_1.routes.grade
            }
        })
            .from(schema_1.climbs)
            .innerJoin(schema_1.routes, (0, drizzle_orm_1.eq)(schema_1.climbs.route_id, schema_1.routes.id))
            .where((0, drizzle_orm_1.eq)(schema_1.climbs.user_id, req.user.id))
            .orderBy(schema_1.climbs.created_at);
        const transformedClimbs = userClimbs.map(climb => ({
            id: climb.id,
            routeId: climb.route_id,
            status: climb.status,
            rating: climb.rating,
            tries: climb.tries,
            notes: climb.notes,
            points: climb.points,
            createdAt: climb.created_at?.toISOString(),
            route: {
                color: climb.route.color,
                grade: climb.route.grade
            }
        }));
        res.json(transformedClimbs);
    }
    catch (error) {
        console.error('Error fetching climbs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
router.get('/', getUserClimbs);
exports.default = router;
