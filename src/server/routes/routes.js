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

    const result = await client.query(`
      SELECT 
        r.id,
        r.grade,
        r.color,
        r.points as base_points,
        FLOOR(r.points * 0.5) as tried_points,
        r.active,
        r.created_at,
        ROUND(AVG(NULLIF(s.rating, 0)), 1) as average_rating,
        COUNT(DISTINCT s.id) as send_count
      FROM routes r
      LEFT JOIN sends s ON r.id = s.route_id
      WHERE r.gym_id = $1 AND r.active = true
      GROUP BY r.id, r.grade, r.color, r.points, r.active, r.created_at
      ORDER BY r.created_at DESC
    `, [1]); // Using default gym_id = 1 for now

    const routes = result.rows.map(route => ({
      id: route.id,
      grade: route.grade,
      color: route.color,
      points: parseInt(route.base_points) || 0,
      tried_points: parseInt(route.tried_points) || 0,
      sendCount: parseInt(route.send_count) || 0,
      createdAt: route.created_at,
      active: route.active,
      average_rating: parseFloat(route.average_rating) || 0
    }));

    console.log('[Routes API] Returning routes:', routes.length);

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