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
        const userClimbs = await db_1.db.query.climbs.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.climbs.userId, req.user.id),
            orderBy: (climbs, { desc }) => [desc(climbs.createdAt)]
        });
        res.json(userClimbs.map(climb => ({
            id: climb.id,
            routeId: climb.routeId,
            status: climb.status,
            rating: climb.rating,
            tries: climb.tries,
            notes: climb.notes,
            points: climb.points,
            createdAt: climb.createdAt
        })));
    }
    catch (error) {
        console.error('Error fetching climbs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
router.get('/', getUserClimbs);
exports.default = router;
