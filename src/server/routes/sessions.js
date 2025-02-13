const express = require('express');
const { createClient } = require('@vercel/postgres');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get all sessions for the current user
router.get('/', async (req, res) => {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('[Sessions API] Connected to database');
    console.log('[Sessions API] User ID:', req.user?.id || 1);

    // Query to get real session data from the sends table
    const result = await client.query(`
      WITH daily_sessions AS (
        SELECT 
          DATE(s.created_at) as session_date,
          COUNT(*) as total_tries,
          COUNT(CASE WHEN s.status = true THEN 1 END) as total_sends,
          SUM(s.points) as total_points,
          json_agg(json_build_object(
            'route_id', s.route_id,
            'tries', s.tries,
            'status', s.status,
            'points', s.points,
            'route', r.grade || ' ' || r.color || ' (' || r.wall_sector || ')',
            'stars', 3  -- Default to 3 stars since rating column doesn't exist yet
          ) ORDER BY s.created_at DESC) as attempts
        FROM sends s
        JOIN routes r ON s.route_id = r.id
        WHERE s.user_id = $1
        GROUP BY DATE(s.created_at)
        ORDER BY DATE(s.created_at) DESC
        LIMIT 10
      )
      SELECT 
        ds.*,
        json_agg(DISTINCT r.grade) as grades
      FROM daily_sessions ds
      LEFT JOIN sends s ON DATE(s.created_at) = ds.session_date
      LEFT JOIN routes r ON s.route_id = r.id
      GROUP BY ds.session_date, ds.total_tries, ds.total_sends, ds.total_points, ds.attempts
      ORDER BY ds.session_date DESC
    `, [req.user?.id || 1]); // Using demo user ID 1 if no user in session

    console.log('[Sessions API] Query result rows:', result.rows.length);

    const sessions = result.rows.map(row => ({
      id: row.session_date.getTime().toString(),
      userId: req.user?.id || 1,
      location: 'Movement Gowanus',
      totalTries: parseInt(row.total_tries),
      totalSends: parseInt(row.total_sends),
      totalPoints: parseInt(row.total_points),
      createdAt: row.session_date.toISOString(),
      attempts: row.attempts.map(attempt => ({
        route: attempt.route,
        tries: attempt.tries,
        status: attempt.status ? 'Sent' : 'Tried',
        stars: 3,  // Default to 3 stars
        points: attempt.points
      }))
    }));

    console.log('[Sessions API] Transformed sessions:', sessions.length);

    res.json(sessions);
  } catch (error) {
    console.error('[Sessions API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sessions data',
      details: error.message
    });
  } finally {
    await client.end();
  }
});

module.exports = router;