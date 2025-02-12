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

    // For now, return mock data since we're still implementing the database schema
    const mockSessions = [
      {
        id: '1',
        userId: 1,
        duration: 2.5,
        location: 'Brooklyn Boulders',
        totalClimbs: 15,
        totalSends: 10,
        totalPoints: 1250,
        avgGrade: 'V4',
        grades: ['V3', 'V4', 'V5'],
        successRate: 66,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // yesterday
      },
      {
        id: '2',
        userId: 1,
        duration: 1.5,
        location: 'Brooklyn Boulders',
        totalClimbs: 8,
        totalSends: 6,
        totalPoints: 750,
        avgGrade: 'V3',
        grades: ['V2', 'V3', 'V4'],
        successRate: 75,
        createdAt: new Date().toISOString() // today
      }
    ];

    // Add cache headers
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('X-Cache-Timestamp', new Date().toISOString());
    res.set('X-Data-Source', 'mock');

    res.json(mockSessions);
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
