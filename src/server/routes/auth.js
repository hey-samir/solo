const express = require('express');
const { createClient } = require('@vercel/postgres');

const router = express.Router();

// Basic authentication status check
router.get('/status', (req, res) => {
  res.json({ 
    authenticated: false,
    message: 'Authentication is currently disabled',
    authType: 'none'
  });
});

// Get current user - returns null when auth is disabled
router.get('/current-user', (req, res) => {
  res.json({
    user: null,
    message: 'Authentication is currently disabled'
  });
});

// Get leaderboard data
router.get('/auth/leaderboard', async (req, res) => {
  const client = createClient({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT 
        u.username,
        COUNT(s.id) as total_sends,
        ROUND(AVG(s.grade_number)::numeric, 1) as avg_grade,
        SUM(s.points) as total_points
      FROM users u
      LEFT JOIN sends s ON u.id = s.user_id
      GROUP BY u.id, u.username
      ORDER BY total_points DESC NULLS LAST
      LIMIT 100
    `);

    const leaderboard = result.rows.map(row => ({
      username: row.username,
      totalSends: parseInt(row.total_sends) || 0,
      avgGrade: row.avg_grade?.toString() || 'N/A',
      totalPoints: parseInt(row.total_points) || 0
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  } finally {
    await client.end();
  }
});

module.exports = router;