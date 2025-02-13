const express = require('express');
const { createClient } = require('@vercel/postgres');
const router = express.Router();

// Helper function to format grade (shared with user.js)
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

// Get leaderboard data
router.get('/', async (req, res) => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[Leaderboard] Error: No database connection string provided');
    return res.status(500).json({ 
      error: 'Database configuration error',
      details: 'No connection string available'
    });
  }

  const client = createClient({
    connectionString: connectionString
  });

  try {
    await client.connect();
    console.log('[Leaderboard] Connected to database, fetching data...');

    const result = await client.query(`
      WITH user_stats AS (
        SELECT 
          u.id,
          u.username,
          COUNT(*) as total_ascents,
          COUNT(CASE WHEN s.status = true THEN 1 END) as total_sends,
          COUNT(CASE WHEN s.status = false THEN 1 END) as burns,
          SUM(s.points) as total_points,
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
          ROW_NUMBER() OVER (ORDER BY SUM(s.points) DESC NULLS LAST) as rank
        FROM users u
        LEFT JOIN sends s ON u.id = s.user_id
        LEFT JOIN routes r ON s.route_id = r.id
        WHERE s.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY u.id, u.username
      )
      SELECT * FROM user_stats
      WHERE total_ascents > 0
      ORDER BY rank ASC
      LIMIT 100;
    `);

    console.log('[Leaderboard] Sample row data:', result.rows[0]);

    const leaderboard = result.rows.map(row => ({
      rank: parseInt(row.rank),
      userId: row.id,
      username: row.username || 'Anonymous',
      burns: parseInt(row.burns) || 0,
      points: parseInt(row.total_points) || 0,
      grade: formatGrade(row.avg_grade),
      totalSends: parseInt(row.total_sends) || 0,
      avgGrade: formatGrade(row.avg_grade)
    }));

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('X-Cache-Timestamp', new Date().toISOString());
    res.set('X-Data-Source', 'database');

    res.json(leaderboard);
  } catch (error) {
    console.error('[Leaderboard] Database Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard data',
      details: error.message
    });
  } finally {
    await client.end().catch(console.error);
  }
});

module.exports = router;