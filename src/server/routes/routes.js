const express = require('express');
const { createClient } = require('@vercel/postgres');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get all routes for a specific gym
router.get('/', async (req, res) => {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('[Routes API] Connected to database, fetching routes...');

    const { gym } = req.query;
    const result = await client.query(`
      SELECT 
        r.id,
        r.grade,
        r.color,
        r.wall_sector,
        r.created_at,
        COUNT(DISTINCT s.id) as send_count,
        AVG(s.rating) as avg_rating
      FROM routes r
      LEFT JOIN sends s ON r.id = s.route_id
      WHERE r.gym_id = $1 AND r.active = true
      GROUP BY r.id, r.grade, r.color, r.wall_sector, r.created_at
      ORDER BY r.created_at DESC
    `, [1]); // Using default gym_id = 1 for now

    const routes = result.rows.map(route => ({
      id: route.id,
      grade: route.grade,
      color: route.color,
      location: route.wall_sector,
      sendCount: parseInt(route.send_count) || 0,
      avgRating: parseFloat(route.avg_rating) || 0,
      createdAt: route.created_at
    }));

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('X-Cache-Timestamp', new Date().toISOString());

    res.json(routes);
  } catch (error) {
    console.error('[Routes API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch routes',
      details: error.message
    });
  } finally {
    await client.end();
  }
});

module.exports = router;