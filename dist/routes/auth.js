"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../middleware/auth"));
const postgres_1 = require("@vercel/postgres");
const router = express_1.default.Router();
const db = (0, postgres_1.createClient)({ connectionString: process.env.DATABASE_URL });
// Google OAuth routes
router.get('/google', auth_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', auth_1.default.authenticate('google', {
    failureRedirect: '/login',
    session: true
}), (req, res) => {
    // Successful authentication, redirect home
    res.redirect('/');
});
// Logout route
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});
// Get current user
router.get('/current-user', (req, res) => {
    if (req.user) {
        res.json(req.user);
    }
    else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});
// Get leaderboard data
router.get('/leaderboard', async (req, res) => {
    try {
        await db.connect();
        const result = await db.query(`
      SELECT 
        u.username,
        COUNT(s.id) as total_sends,
        ROUND(AVG(CAST(s.grade_number as float)), 1) as avg_grade,
        SUM(s.points) as total_points
      FROM users u
      LEFT JOIN sends s ON u.id = s.user_id
      GROUP BY u.id, u.username
      ORDER BY total_points DESC
      LIMIT 100
    `);
        const leaderboard = result.rows.map(row => ({
            username: row.username,
            totalSends: parseInt(row.total_sends),
            avgGrade: row.avg_grade?.toString() || 'N/A',
            totalPoints: parseInt(row.total_points) || 0
        }));
        res.json(leaderboard);
    }
    catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard data' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map