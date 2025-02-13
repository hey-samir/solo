const express = require('express');
const { createClient } = require('@vercel/postgres');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Standardized stats calculation function
const calculateUserStats = async (client, userId) => {
  console.log('[User Stats] Calculating stats for user:', userId);

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

  return {
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
};

// Get user stats
router.get('/me/stats', async (req, res) => {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('[User Stats API] Connected to database, fetching user stats...');

    const userId = req.user?.id || 1;
    const stats = await calculateUserStats(client, userId);

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300');
    res.set('X-Cache-Timestamp', new Date().toISOString());

    res.json(stats);
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

    // Simplified query focusing on core metrics first
    const result = await client.query(`
      SELECT 
        DATE(s.created_at) as date,
        COUNT(*) as attempts,
        COUNT(CASE WHEN s.status = true THEN 1 END) as sends,
        COALESCE(SUM(s.points), 0) as points,
        COUNT(DISTINCT s.route_id) as unique_routes,
        ROUND(AVG(CASE 
          WHEN r.grade ~ '^5\\.\\d+[a-d]?$' 
          THEN CAST(SUBSTRING(r.grade, 3, 2) AS DECIMAL) 
          ELSE NULL 
        END), 1) as avg_grade
      FROM sends s
      JOIN routes r ON s.route_id = r.id
      WHERE s.user_id = $1
      GROUP BY DATE(s.created_at)
      ORDER BY date DESC
      LIMIT 30
    `, [userId]);

    console.log('[User Stats Charts API] Raw data sample:', result.rows[0]);

    const chartData = result.rows.map(row => {
      console.log('Processing row:', row);
      return {
        date: row.date.toISOString().split('T')[0],
        attempts: parseInt(row.attempts) || 0,
        sends: parseInt(row.sends) || 0,
        points: parseInt(row.points) || 0,
        uniqueRoutes: parseInt(row.unique_routes) || 0,
        avgGrade: row.avg_grade ? `5.${row.avg_grade}` : null
      };
    })
    .filter(data => data.date != null)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('[User Stats Charts API] Successfully prepared chart data:', {
      dataPoints: chartData.length,
      firstDate: chartData[0]?.date,
      lastDate: chartData[chartData.length - 1]?.date,
      samplePoint: chartData[0]
    });

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