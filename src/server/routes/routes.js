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

    // Update routes to be inactive except for specific IDs
    await client.query(`
      UPDATE routes 
      SET active = CASE 
        WHEN id IN (2956, 2957, 2958, 2959, 2960, 2962, 2963, 2964) THEN true 
        ELSE false 
      END
    `);

    const result = await client.query(`
      SELECT 
        r.id,
        r.grade,
        r.color,
        r.wall_sector,
        r.active,
        r.created_at,
        s.points,
        FLOOR(s.points * 0.5) as tried_points,
        ROUND(AVG(NULLIF(s.rating, 0)), 1) as average_rating,
        COUNT(DISTINCT s.id) as send_count
      FROM routes r
      LEFT JOIN sends s ON r.id = s.route_id
      WHERE r.gym_id = $1 AND r.active = true
      GROUP BY r.id, r.grade, r.color, r.wall_sector, r.active, r.created_at, s.points
      ORDER BY r.created_at DESC
    `, [1]); // Using default gym_id = 1 for now

    const routes = result.rows.map(route => ({
      id: route.id,
      grade: route.grade,
      color: route.color,
      wall_sector: route.wall_sector,
      anchor_number: 1, // Default value since it's not in the current schema
      sendCount: parseInt(route.send_count) || 0,
      createdAt: route.created_at,
      active: route.active,
      points: parseInt(route.points) || 0,
      tried_points: parseInt(route.tried_points) || 0,
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