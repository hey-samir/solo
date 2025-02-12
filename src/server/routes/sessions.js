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

    // Updated mock data with correct point values based on grade table
    const mockSessions = [
      {
        id: '1',
        userId: 1,
        location: 'Brooklyn Boulders',
        totalTries: 15,
        totalSends: 10,
        totalPoints: 157.5, // Sum of all points including tried routes
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
        attempts: [
          { route: 'Blue: 5.10a', tries: 3, status: 'Sent', stars: 4, points: 50 },
          { route: 'Red: 5.11b', tries: 2, status: 'Sent', stars: 5, points: 70 },
          { route: 'Black: 5.11c', tries: 4, status: 'Tried', stars: 3, points: 37.5 }, // 0.5 * 75 for tried
        ]
      },
      {
        id: '2',
        userId: 1,
        location: 'Brooklyn Boulders',
        totalTries: 8,
        totalSends: 6,
        totalPoints: 132.5, // Sum of all points including tried routes
        createdAt: new Date().toISOString(), // today
        attempts: [
          { route: 'Yellow: 5.9+', tries: 2, status: 'Sent', stars: 5, points: 45 },
          { route: 'Green: 5.10b', tries: 3, status: 'Tried', stars: 4, points: 27.5 }, // 0.5 * 55 for tried
          { route: 'Pink: 5.10c', tries: 1, status: 'Sent', stars: 3, points: 60 },
        ]
      }
    ];

    // Sort sessions by date (most recent first)
    mockSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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