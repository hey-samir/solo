const express = require('express');
const { createClient } = require('@vercel/postgres');

const router = express.Router();

// Get climbing statistics for a user
router.get('/', async (req, res) => {
  console.log('[Stats API] Received request for stats');
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
          COUNT(DISTINCT DATE(created_at)) as total_sessions,
          SUM(CASE WHEN status = false THEN 1 END) as total_burns
        FROM sends
        WHERE user_id = $1
      ),
      grade_stats AS (
        SELECT 
          ROUND(AVG(CASE 
            WHEN r.grade ~ '^5\\.\\d+[a-d]?$' 
            THEN (
              CAST(SUBSTRING(r.grade, 3, 2) AS DECIMAL) + 
              CASE 
                WHEN r.grade ~ 'a$' THEN 0.0
                WHEN r.grade ~ 'b$' THEN 0.25
                WHEN r.grade ~ 'c$' THEN 0.5
                WHEN r.grade ~ 'd$' THEN 0.75
                ELSE 0
              END
            )
            ELSE NULL 
          END), 2) as avg_grade,
          ROUND(AVG(CASE 
            WHEN s.status = true AND r.grade ~ '^5\\.\\d+[a-d]?$'
            THEN (
              CAST(SUBSTRING(r.grade, 3, 2) AS DECIMAL) +
              CASE 
                WHEN r.grade ~ 'a$' THEN 0.0
                WHEN r.grade ~ 'b$' THEN 0.25
                WHEN r.grade ~ 'c$' THEN 0.5
                WHEN r.grade ~ 'd$' THEN 0.75
                ELSE 0
              END
            )
            ELSE NULL 
          END), 2) as avg_sent_grade
        FROM sends s
        JOIN routes r ON s.route_id = r.id
        WHERE s.user_id = $1
      )
      SELECT 
        us.*,
        gs.avg_grade,
        gs.avg_sent_grade
      FROM user_stats us
      CROSS JOIN grade_stats gs
    `, [userId]);

    const stats = result.rows[0];
    console.log('[Stats API] Retrieved stats:', stats);

    // Helper function to format grade
    const formatGrade = (grade) => {
      if (!grade) return 'N/A';
      const baseGrade = Math.floor(grade);
      const fraction = grade - baseGrade;
      let letter = 'a';
      if (fraction >= 0.25 && fraction < 0.5) letter = 'b';
      else if (fraction >= 0.5 && fraction < 0.75) letter = 'c';
      else if (fraction >= 0.75) letter = 'd';
      return `5.${baseGrade}${letter}`;
    };

    const response = {
      totalAscents: parseInt(stats?.total_ascents) || 0,
      totalSends: parseInt(stats?.total_sends) || 0,
      totalPoints: parseInt(stats?.total_points) || 0,
      burns: parseInt(stats?.total_burns) || 0,
      avgGrade: formatGrade(stats?.avg_grade),
      avgSentGrade: formatGrade(stats?.avg_sent_grade),
      avgPointsPerClimb: Math.round(stats?.total_points / stats?.total_ascents) || 0,
      successRate: Math.round((stats?.total_sends / stats?.total_ascents) * 100) || 0,
      successRatePerSession: Math.round((stats?.total_sends / stats?.total_sessions) * 100) || 0,
      climbsPerSession: Math.round(stats?.total_ascents / stats?.total_sessions) || 0,
      avgAttemptsPerClimb: Math.round(stats?.avg_attempts * 10) / 10 || 0
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
    await client.end().catch(console.error);
  }
});

module.exports = router;