"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        console.log('[Routes API] Fetching routes...');
        const allRoutes = await db_1.db
            .select({
            id: schema_1.routes.id,
            color: schema_1.routes.color,
            grade: schema_1.routes.grade,
            wall_sector: schema_1.routes.wall_sector,
            anchor_number: schema_1.routes.anchor_number,
            created_at: schema_1.routes.created_at
        })
            .from(schema_1.routes)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.routes.created_at));
        // Ensure we always return an array
        const routesData = allRoutes || [];
        console.log('[Routes API] Routes fetched:', {
            count: routesData.length,
            sample: routesData.slice(0, 2)
        });
        res.json(routesData);
    }
    catch (error) {
        console.error('[Routes API] Error fetching routes:', error);
        res.status(500).json({
            error: 'Failed to fetch routes',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
