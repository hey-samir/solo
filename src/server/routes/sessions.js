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
      WITH daily_sends AS (
        SELECT 
          DATE(s.created_at) as session_date,
          COUNT(*) as total_tries,
          COUNT(CASE WHEN s.status = true THEN 1 END) as total_sends,
          SUM(s.points) as total_points,
          string_agg(
            CONCAT(
              r.grade, '|',
              r.color, '|',
              s.tries, '|',
              s.status, '|',
              s.points
            ),
            ';' ORDER BY s.created_at DESC
          ) as attempts_data
        FROM sends s
        JOIN routes r ON s.route_id = r.id
        WHERE s.user_id = $1
        GROUP BY DATE(s.created_at)
        ORDER BY DATE(s.created_at) DESC
        LIMIT 10
      )
      SELECT 
        session_date,
        total_tries,
        total_sends,
        total_points,
        attempts_data
      FROM daily_sends
    `, [req.user?.id || 1]); // Using demo user ID 1 if no user in session

    console.log('[Sessions API] Query result rows:', result.rows.length);

    const sessions = result.rows.map(row => {
      const attempts = row.attempts_data ? row.attempts_data.split(';').map(attempt => {
        const [grade, color, tries, status, points] = attempt.split('|');
        return {
          route: `${grade} ${color}`,
          tries: parseInt(tries),
          status: status === 'true' ? 'Sent' : 'Tried',
          stars: 3,  // Default to 3 stars
          points: parseInt(points)
        };
      }) : [];

      return {
        id: row.session_date.getTime().toString(),
        userId: req.user?.id || 1,
        location: 'Movement Gowanus',
        totalTries: parseInt(row.total_tries),
        totalSends: parseInt(row.total_sends),
        totalPoints: parseInt(row.total_points),
        createdAt: row.session_date.toISOString(),
        attempts: attempts
      };
    });

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