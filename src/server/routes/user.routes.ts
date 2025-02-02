import { Router, Request } from 'express';
import { db } from '../db';
import { users, User } from '../db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: User;
}

// Convert database user to API response format
const formatUserResponse = (user: any) => ({
  id: user.id,
  username: user.username,
  displayName: user.name,
  email: user.email,
  profilePhoto: user.profile_photo,
  memberSince: user.member_since?.toISOString(),
  createdAt: user.created_at?.toISOString(),
  gym: user.gym ? {
    id: user.gym.id,
    name: user.gym.name
  } : null
});

// Protect all stats routes with authentication
router.use('/me', isAuthenticated);

// Get user stats
router.get('/me/stats', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Please log in to view statistics' });
      return;
    }

    // For now using mock data, will replace with actual DB queries later
    const mockStats = {
      totalAscents: 150,
      totalSends: 120,
      totalPoints: 5000,
      avgGrade: "5.10b",
      avgSentGrade: "5.10a",
      avgPointsPerClimb: 33.3,
      successRate: 80,
      successRatePerSession: 75,
      climbsPerSession: 12,
      avgAttemptsPerClimb: 2.5
    };

    res.json(mockStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user stats charts data
router.get('/me/stats/charts', async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Please log in to view statistics' });
      return;
    }

    // Mock chart data for development
    const mockChartData = {
      ascentsByDifficulty: {
        labels: ['5.8', '5.9', '5.10a', '5.10b', '5.10c'],
        data: [10, 15, 8, 12, 5]
      },
      sendsByDate: {
        labels: Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse(),
        sends: [5, 7, 4, 8, 6, 9, 7],
        attempts: [2, 3, 1, 4, 2, 3, 2]
      },
      metricsOverTime: {
        labels: Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse(),
        metrics: [{
          name: 'Send Rate',
          data: [75, 80, 85, 82, 88, 85, 90]
        }]
      },
      climbsPerSession: {
        labels: Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse(),
        data: [8, 10, 7, 12, 9, 11, 10]
      },
      sendRateByColor: {
        labels: ['Red', 'Blue', 'Green', 'Yellow', 'White'],
        data: [85, 75, 90, 80, 70]
      }
    };

    res.json(mockChartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chart data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user profile by username
router.get('/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, cleanUsername))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(formatUserResponse(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;