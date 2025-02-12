const express = require('express');
const { createClient } = require('@vercel/postgres');
const router = express.Router();

// Get leaderboard data
router.get('/', async (req, res) => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[Leaderboard] Error: No database connection string provided');
    return res.status(500).json({ 
      error: 'Database configuration error',
      details: 'No connection string available'
    });
  }

  const client = createClient({
    connectionString: connectionString
  });

  try {
    await client.connect();
    console.log('[Leaderboard] Connected to database, fetching data...');

    const result = await client.query(`
      SELECT 
        u.username,
        COUNT(s.id) as total_sends,
        COUNT(CASE WHEN s.status = true THEN 1 END) as successful_sends,
        SUM(s.points) as total_points
      FROM users u
      LEFT JOIN sends s ON u.id = s.user_id
      GROUP BY u.id, u.username
      ORDER BY total_points DESC NULLS LAST
      LIMIT 100
    `);

    const leaderboard = result.rows.map(row => ({
      username: row.username || 'Anonymous',
      totalSends: parseInt(row.total_sends) || 0,
      avgGrade: row.successful_sends && row.total_sends 
        ? `${Math.round((row.successful_sends / row.total_sends) * 100)}%` 
        : '0%',
      totalPoints: parseInt(row.total_points) || 0
    }));

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('X-Cache-Timestamp', new Date().toISOString());
    res.set('X-Data-Source', 'database');

    res.json(leaderboard);
  } catch (error) {
    console.error('[Leaderboard] Database Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard data',
      details: error.message
    });
  } finally {
    await client.end().catch(console.error);
  }
});

module.exports = router;