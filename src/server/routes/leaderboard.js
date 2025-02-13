const express = require('express');
const { createClient } = require('@vercel/postgres');
const router = express.Router();

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

    // First, let's log some sample grades to debug
    const gradesSample = await client.query(`
      SELECT DISTINCT grade FROM routes WHERE grade IS NOT NULL LIMIT 5;
    `);
    console.log('[Leaderboard] Sample grades:', gradesSample.rows);

    const result = await client.query(`
      WITH RankedUsers AS (
        SELECT 
          u.id,
          u.username,
          COUNT(s.id) as burns,
          AVG(s.tries) as avg_tries,
          SUM(s.points) as points,
          STRING_AGG(DISTINCT r.grade, ', ' ORDER BY r.grade) as grades_list,
          AVG(
            CASE 
              WHEN r.grade ~ '^5\\.(\\d+)[abcd]?$' 
              THEN (
                CAST(SUBSTRING(r.grade, 3, 2) AS DECIMAL) + 
                CASE 
                  WHEN r.grade LIKE '%a' THEN 0.0
                  WHEN r.grade LIKE '%b' THEN 0.25
                  WHEN r.grade LIKE '%c' THEN 0.5
                  WHEN r.grade LIKE '%d' THEN 0.75
                  ELSE 0
                END
              )
              ELSE NULL 
            END
          ) as avg_grade,
          ROW_NUMBER() OVER (ORDER BY SUM(s.points) DESC NULLS LAST) as rank
        FROM users u
        LEFT JOIN sends s ON u.id = s.user_id
        LEFT JOIN routes r ON s.route_id = r.id
        WHERE s.created_at >= NOW() - INTERVAL '30 days'
          AND r.grade IS NOT NULL
          AND r.grade ~ '^5\\.'  -- Only include grades starting with '5.'
        GROUP BY u.id, u.username
      )
      SELECT 
        rank,
        id,
        username,
        burns,
        avg_tries,
        points,
        avg_grade,
        grades_list
      FROM RankedUsers
      ORDER BY rank ASC
      LIMIT 100;
    `);

    console.log('[Leaderboard] Sample row data:', result.rows[0]);

    const leaderboard = result.rows.map(row => {
      const gradeNum = row.avg_grade;
      let formattedGrade = 'N/A';

      if (gradeNum !== null) {
        const baseGrade = Math.floor(gradeNum);
        const decimal = gradeNum - baseGrade;
        let letter = '';

        if (decimal <= 0.12) letter = '';
        else if (decimal <= 0.37) letter = 'a';
        else if (decimal <= 0.62) letter = 'b';
        else if (decimal <= 0.87) letter = 'c';
        else letter = 'd';

        formattedGrade = `5.${baseGrade}${letter}`;
      }

      console.log(`[Leaderboard] Processing user ${row.username}: avg_grade=${row.avg_grade}, formatted=${formattedGrade}`);

      return {
        rank: row.rank,
        userId: row.id,
        username: row.username || 'Anonymous',
        burns: parseInt(row.burns) || 0,
        points: parseInt(row.points) || 0,
        grade: formattedGrade,
        totalSends: parseInt(row.burns) || 0,
        avgGrade: formattedGrade
      };
    });

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