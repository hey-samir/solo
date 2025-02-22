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
router.get('/standings', async (req, res) => {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('[Standings API] Connected to database, fetching standings...');

    const result = await client.query(`
      SELECT 
        u.id as user_id,
        u.username,
        COUNT(s.id) as total_burns,
        AVG(CASE 
          WHEN s.grade ~ '^5\\.\\d+[a-d]?$' 
          THEN CAST(SUBSTRING(s.grade, 3, 2) AS DECIMAL) 
          ELSE NULL 
        END) as avg_grade,
        SUM(s.points) as total_points
      FROM users u
      LEFT JOIN sends s ON u.id = s.user_id
      GROUP BY u.id, u.username
      ORDER BY total_points DESC NULLS LAST
      LIMIT 100
    `);

    const standings = result.rows.map((row, index) => ({
      userId: row.user_id,
      username: row.username || 'Anonymous',
      burns: parseInt(row.total_burns) || 0,
      grade: row.avg_grade ? `5.${Math.round(row.avg_grade * 10) / 10}` : 'N/A',
      points: parseInt(row.total_points) || 0,
      rank: index + 1
    }));

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('X-Cache-Timestamp', new Date().toISOString());
    res.set('X-Data-Source', 'database');

    res.json(standings);
  } catch (error) {
    console.error('[Standings API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch standings data',
      details: error.message
    });
  } finally {
    try {
      await client.end();
    } catch (error) {
      console.error('[Standings API] Error closing database connection:', error);
    }
  }
});

module.exports = router;