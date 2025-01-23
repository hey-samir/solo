"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
const getUserRoutes = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const userRoutes = await db_1.db.query.routes.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.routes.gymId, req.user.gymId)
        });
        res.json(userRoutes.map(route => ({
            id: route.id,
            routeId: route.routeId,
            color: route.color,
            grade: route.grade,
            rating: route.rating,
            dateSet: route.dateSet
        })));
    }
    catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
router.get('/', getUserRoutes);
exports.default = router;
