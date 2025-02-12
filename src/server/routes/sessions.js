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
    console.log('[Sessions] Connected to database, fetching sessions...');

    // Query to get real session data from the sends table
    const result = await client.query(`
      WITH daily_sessions AS (
        SELECT 
          DATE(created_at) as session_date,
          COUNT(*) as total_tries,
          COUNT(CASE WHEN status = true THEN 1 END) as total_sends,
          SUM(points) as total_points,
          json_agg(json_build_object(
            'route_id', route_id,
            'tries', tries,
            'status', status,
            'points', points,
            'created_at', created_at
          ) ORDER BY created_at DESC) as attempts
        FROM sends
        WHERE user_id = $1
        GROUP BY DATE(created_at)
        ORDER BY session_date DESC
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

    const sessions = result.rows.map(row => ({
      id: row.session_date.getTime().toString(),
      userId: req.user?.id || 1,
      location: 'Brooklyn Boulders', // TODO: Add gym location from routes table
      totalTries: parseInt(row.total_tries),
      totalSends: parseInt(row.total_sends),
      totalPoints: parseInt(row.total_points),
      createdAt: row.session_date.toISOString(),
      attempts: row.attempts
    }));

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('X-Cache-Timestamp', new Date().toISOString());
    res.set('X-Data-Source', 'database');

    res.json(sessions);
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch sessions data',
      details: error.message
    });
  } finally {
    await client.end().catch(console.error);
  }
});

module.exports = router;