const express = require('express');
const { createClient } = require('@vercel/postgres');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get user stats
router.get('/me/stats', async (req, res) => {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('[User Stats API] Connected to database, fetching user stats...');

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
      totalAscents: parseInt(stats?.total_ascents) || 0,
      totalSends: parseInt(stats?.total_sends) || 0,
      totalPoints: parseInt(stats?.total_points) || 0,
      avgGrade: stats?.avg_grade ? `5.${Math.round(stats.avg_grade * 10) / 10}` : 'N/A',
      avgSentGrade: stats?.avg_sent_grade ? `5.${Math.round(stats.avg_sent_grade * 10) / 10}` : 'N/A',
      avgPointsPerClimb: Math.round(stats?.avg_points_per_climb || 0),
      successRate: Math.round(stats?.success_rate || 0),
      successRatePerSession: Math.round((stats?.total_sends / stats?.total_sessions) * 100) || 0,
      climbsPerSession: Math.round(stats?.climbs_per_session || 0),
      avgAttemptsPerClimb: Math.round(stats?.avg_attempts * 10) / 10 || 0
    };

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300');
    res.set('X-Cache-Timestamp', new Date().toISOString());

    res.json(response);
  } catch (error) {
    console.error('[User Stats API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user statistics',
      details: error.message
    });
  } finally {
    await client.end().catch(console.error);
  }
});

// Get user stats charts data
router.get('/me/stats/charts', async (req, res) => {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('[User Stats Charts API] Connected to database, fetching chart data...');

    const userId = req.user?.id || 1;

    const result = await client.query(`
      WITH daily_stats AS (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as attempts,
          COUNT(CASE WHEN status = true THEN 1 END) as sends,
          SUM(points) as points,
          COUNT(DISTINCT route_id) as unique_routes
        FROM sends
        WHERE user_id = $1
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      ),
      grade_progression AS (
        SELECT 
          DATE(s.created_at) as date,
          AVG(CASE 
            WHEN r.grade ~ '^5\\.\\d+[a-d]?$' 
            THEN CAST(SUBSTRING(r.grade, 3, 2) AS DECIMAL) 
            ELSE NULL 
          END) as avg_grade
        FROM sends s
        JOIN routes r ON s.route_id = r.id
        WHERE s.user_id = $1 AND s.status = true
        GROUP BY DATE(s.created_at)
        ORDER BY date DESC
        LIMIT 30
      )
      SELECT 
        ds.*,
        gp.avg_grade
      FROM daily_stats ds
      LEFT JOIN grade_progression gp ON ds.date = gp.date
      ORDER BY ds.date ASC
    `, [userId]);

    const chartData = result.rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      attempts: parseInt(row.attempts),
      sends: parseInt(row.sends),
      points: parseInt(row.points),
      uniqueRoutes: parseInt(row.unique_routes),
      avgGrade: row.avg_grade ? `5.${Math.round(row.avg_grade * 10) / 10}` : null
    }));

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300');
    res.set('X-Cache-Timestamp', new Date().toISOString());

    res.json(chartData);
  } catch (error) {
    console.error('[User Stats Charts API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chart data',
      details: error.message
    });
  } finally {
    await client.end().catch(console.error);
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // For now, return a mock profile since auth is disabled
    res.json({
      id: 1,
      username: 'Guest',
      email: null,
      name: 'Guest User',
      profilePhoto: null,
      memberSince: new Date().toISOString(),
      gymId: 1,
      userType: 'guest'
    });
  } catch (error) {
    console.error('[Profile API] Error:', error);
    res.status(500).json({ 
      error: 'Unable to load your profile. Please try again later.',
      details: error.message || 'Unknown error'
    });
  }
});

module.exports = router;