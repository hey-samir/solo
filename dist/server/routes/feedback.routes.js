"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Ensure uploads directory exists
const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'screenshots');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage });
// Get feedback items with optional sorting
router.get('/', async (req, res) => {
    try {
        const { sort = 'new' } = req.query;
        console.log('[Feedback API] GET request received:', {
            sort,
            headers: req.headers,
            path: req.path
        });
        const results = await db_1.db
            .select({
            id: schema_1.feedback.id,
            title: schema_1.feedback.title,
            description: schema_1.feedback.description,
            category: schema_1.feedback.category,
            screenshot_url: schema_1.feedback.screenshot_url,
            created_at: schema_1.feedback.created_at,
            upvotes: schema_1.feedback.upvotes,
            user: {
                username: schema_1.users.username
            }
        })
            .from(schema_1.feedback)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.feedback.user_id, schema_1.users.id))
            .orderBy(sort === 'new' ? (0, drizzle_orm_1.desc)(schema_1.feedback.created_at) : (0, drizzle_orm_1.desc)(schema_1.feedback.upvotes));
        console.log('[Feedback API] Query completed:', {
            resultCount: results?.length || 0
        });
        const feedbackData = results.map(item => ({
            id: item.id,
            title: item.title || '',
            description: item.description || '',
            category: item.category || 'general',
            screenshotUrl: item.screenshot_url,
            createdAt: item.created_at,
            upvotes: item.upvotes || 0,
            username: item.user?.username || 'Anonymous'
        }));
        res.json(feedbackData);
    }
    catch (error) {
        console.error('[Feedback API] Error in GET route:', error);
        res.status(500).json({
            error: "Failed to fetch feedback",
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Submit new feedback
router.post('/', upload.single('screenshot'), async (req, res) => {
    try {
        const { title, description, category } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Please log in to submit feedback.' });
            return;
        }
        const [newFeedback] = await db_1.db.insert(schema_1.feedback)
            .values({
            title,
            description,
            category,
            user_id: userId,
            screenshot_url: req.file?.path,
            upvotes: 0,
            created_at: new Date()
        })
            .returning();
        console.log('[Feedback API] Created feedback:', newFeedback);
        res.status(201).json({
            id: newFeedback.id,
            title: newFeedback.title,
            description: newFeedback.description,
            category: newFeedback.category,
            screenshotUrl: newFeedback.screenshot_url,
            createdAt: newFeedback.created_at,
            upvotes: newFeedback.upvotes,
            username: req.user?.username || 'Anonymous'
        });
    }
    catch (error) {
        console.error('[Feedback API] Error in POST route:', error);
        res.status(500).json({
            error: "Failed to submit feedback",
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=feedback.routes.js.map