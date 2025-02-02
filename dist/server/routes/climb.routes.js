"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication middleware
router.use(auth_1.isAuthenticated);
// Get all climbs
router.get('/', auth_1.isAuthenticated, async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                error: 'Please log in to view climbs',
                details: 'Authentication required'
            });
            return;
        }
        const climbs = await db_1.db
            .select()
            .from(schema_1.sends)
            .leftJoin(schema_1.routes, (0, drizzle_orm_1.eq)(schema_1.sends.route_id, schema_1.routes.id))
            .where((0, drizzle_orm_1.eq)(schema_1.sends.user_id, req.user.id))
            .orderBy(schema_1.sends.created_at);
        res.json(climbs);
    }
    catch (error) {
        console.error('[Climbs API] Error fetching climbs:', error);
        res.status(500).json({
            error: 'Failed to fetch climbs',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Get specific climb
router.get('/:id', auth_1.isAuthenticated, async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                error: 'Please log in to view climb details',
                details: 'Authentication required'
            });
            return;
        }
        const climb = await db_1.db
            .select()
            .from(schema_1.sends)
            .leftJoin(schema_1.routes, (0, drizzle_orm_1.eq)(schema_1.sends.route_id, schema_1.routes.id))
            .where((0, drizzle_orm_1.eq)(schema_1.sends.id, parseInt(req.params.id)))
            .limit(1);
        if (!climb.length) {
            res.status(404).json({
                error: 'Climb not found',
                details: 'The requested climb could not be found'
            });
            return;
        }
        res.json(climb[0]);
    }
    catch (error) {
        console.error('[Climbs API] Error fetching climb:', error);
        res.status(500).json({
            error: 'Failed to fetch climb details',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
