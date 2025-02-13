const express = require('express');
const { createClient } = require('@vercel/postgres');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get climbing statistics for a user
router.get('/', async (req, res) => {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('[Stats API] Connected to database, fetching stats...');

    // For demo purposes, using a fixed user ID
    const userId = req.user?.id || 1;

    const result = await client.query(`
      WITH user_stats AS (
        SELECT 
          COUNT(*) as total_ascents,
          COUNT(CASE WHEN status = true THEN 1 END) as total_sends,
          SUM(points) as total_points,
          AVG(tries) as avg_attempts,
          COUNT(DISTINCT DATE(created_at)) as total_sessions
        FROM sends
        WHERE user_id = $1
      ),
      grade_stats AS (
        SELECT 
          AVG(CASE 
            WHEN r.grade ~ '^5\\.\\d+[a-d]?$' 
            THEN CAST(SUBSTRING(r.grade, 3, 2) AS DECIMAL) 
            ELSE NULL 
          END) as avg_grade,
          AVG(CASE 
            WHEN s.status = true AND r.grade ~ '^5\\.\\d+[a-d]?$'
            THEN CAST(SUBSTRING(r.grade, 3, 2) AS DECIMAL)
            ELSE NULL 
          END) as avg_sent_grade
        FROM sends s
        JOIN routes r ON s.route_id = r.id
        WHERE s.user_id = $1
      )
      SELECT 
        us.*,
        gs.avg_grade,
        gs.avg_sent_grade,
        us.total_points::float / NULLIF(us.total_ascents, 0) as avg_points_per_climb,
        us.total_sends::float / NULLIF(us.total_ascents, 0) * 100 as success_rate,
        us.total_ascents::float / NULLIF(us.total_sessions, 0) as climbs_per_session
      FROM user_stats us
      CROSS JOIN grade_stats gs
    `, [userId]);

    const stats = result.rows[0];
    
    const response = {
      totalAscents: parseInt(stats.total_ascents) || 0,
      totalSends: parseInt(stats.total_sends) || 0,
      totalPoints: parseInt(stats.total_points) || 0,
      avgGrade: stats.avg_grade ? `5.${Math.round(stats.avg_grade * 10) / 10}` : 'N/A',
      avgSentGrade: stats.avg_sent_grade ? `5.${Math.round(stats.avg_sent_grade * 10) / 10}` : 'N/A',
      avgPointsPerClimb: Math.round(stats.avg_points_per_climb || 0),
      successRate: Math.round(stats.success_rate || 0),
      successRatePerSession: Math.round((stats.total_sends / stats.total_sessions) * 100) || 0,
      climbsPerSession: Math.round(stats.climbs_per_session || 0),
      avgAttemptsPerClimb: Math.round(stats.avg_attempts * 10) / 10 || 0
    };

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('X-Cache-Timestamp', new Date().toISOString());

    res.json(response);
  } catch (error) {
    console.error('[Stats API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch climbing statistics',
      details: error.message
    });
  } finally {
    await client.end();
  }
});

module.exports = router;
