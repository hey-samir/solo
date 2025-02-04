const express = require('express');
const { createClient } = require('@vercel/postgres');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();
const db = createClient({ connectionString: process.env.DATABASE_URL });

// Get user stats
router.get('/me/stats', isAuthenticated, async (req, res) => {
  try {
    // For now, return mock stats since auth is disabled
    res.json({
      totalAscents: 0,
      totalSends: 0,
      totalPoints: 0,
      avgGrade: 'N/A',
      avgSentGrade: 'N/A',
      avgPointsPerClimb: 0,
      successRate: 0,
      successRatePerSession: 0,
      climbsPerSession: 0,
      avgAttemptsPerClimb: 0
    });
  } catch (error) {
    console.error('[Stats API] Error:', error);
    res.status(500).json({ 
      error: 'Unable to load your climbing statistics. Please try again later.',
      details: error.message || 'Unknown error'
    });
  }
});

// Get user profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    // For now, return a mock profile since auth is disabled
    res.json({
      id: null,
      username: 'Guest',
      email: null,
      name: 'Guest User',
      profilePhoto: null,
      memberSince: new Date().toISOString(),
      gymId: null,
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
