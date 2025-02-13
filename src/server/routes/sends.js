const express = require('express');
const { createClient } = require('@vercel/postgres');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get sends for the current user
router.get('/', async (req, res) => {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('[Sends API] Connected to database, fetching sends...');

    const userId = req.user?.id || 1; // Using demo user ID 1 if no user in session

    const result = await client.query(`
      SELECT 
        s.id,
        s.route_id,
        s.tries,
        s.status,
        s.points,
        s.created_at,
        r.grade,
        r.color,
        r.wall_sector
      FROM sends s
      JOIN routes r ON s.route_id = r.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
      LIMIT 50
    `, [userId]);

    const sends = result.rows.map(send => ({
      id: send.id,
      routeId: send.route_id,
      tries: send.tries,
      status: send.status,
      points: send.points,
      grade: send.grade,
      color: send.color,
      location: send.wall_sector,
      createdAt: send.created_at
    }));

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('X-Cache-Timestamp', new Date().toISOString());

    res.json(sends);
  } catch (error) {
    console.error('[Sends API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sends',
      details: error.message
    });
  } finally {
    await client.end();
  }
});

module.exports = router;
