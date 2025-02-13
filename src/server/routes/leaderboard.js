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
      WITH RankedUsers AS (
        SELECT 
          u.id,
          u.username,
          COUNT(s.id) as burns,
          SUM(s.points) as points,
          ROW_NUMBER() OVER (ORDER BY SUM(s.points) DESC NULLS LAST) as rank
        FROM users u
        LEFT JOIN sends s ON u.id = s.user_id
        WHERE s.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY u.id, u.username
      )
      SELECT 
        rank,
        username,
        burns,
        points
      FROM RankedUsers
      ORDER BY rank ASC
      LIMIT 100;
    `);

    const leaderboard = result.rows.map(row => ({
      rank: row.rank,
      userId: row.id,
      username: row.username || 'Anonymous',
      burns: parseInt(row.burns) || 0,
      points: parseInt(row.points) || 0,
      grade: 'N/A', // We'll implement grade calculation in a future update
      totalSends: parseInt(row.burns) || 0,
      avgGrade: 'N/A' // We'll implement grade calculation in a future update
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