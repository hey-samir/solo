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

    const result = await client.query(`
      WITH RankedUsers AS (
        SELECT 
          u.id,
          u.username,
          COUNT(s.id) as burns,
          AVG(s.tries) as avg_tries,
          SUM(s.points) as points,
          AVG(s.points) as avg_points,
          ROW_NUMBER() OVER (ORDER BY SUM(s.points) DESC NULLS LAST) as rank
        FROM users u
        LEFT JOIN sends s ON u.id = s.user_id
        WHERE s.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY u.id, u.username
      )
      SELECT 
        rank,
        id,
        username,
        burns,
        avg_tries,
        points,
        avg_points
      FROM RankedUsers
      ORDER BY rank ASC
      LIMIT 100;
    `);

    console.log('[Leaderboard] Sample row data:', result.rows[0]);

    const leaderboard = result.rows.map(row => {
      const avgPoints = row.avg_points;
      let formattedGrade = 'N/A';

      if (avgPoints !== null) {
        // Convert points to grade (points/10 = grade number)
        const gradeNum = avgPoints / 10;
        const baseGrade = Math.floor(gradeNum);
        const decimal = gradeNum - baseGrade;
        let letter = '';

        // Convert decimal to letter grade
        if (decimal <= 0.12) letter = '';
        else if (decimal <= 0.37) letter = 'a';
        else if (decimal <= 0.62) letter = 'b';
        else if (decimal <= 0.87) letter = 'c';
        else letter = 'd';

        formattedGrade = `5.${baseGrade}${letter}`;
      }

      console.log(`[Leaderboard] Processing user ${row.username}: avg_points=${row.avg_points}, formatted=${formattedGrade}`);

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