import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, gyms, climbs, routes } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Convert database user to API response format
const formatUserResponse = (user: any) => ({
  id: user.id,
  username: user.username,
  displayName: user.name,
  email: user.email,
  profilePhoto: user.profile_photo,
  memberSince: user.member_since.toISOString(),
  createdAt: user.created_at.toISOString(),
  gym: user.gym ? {
    id: user.gym.id,
    name: user.gym.name
  } : null
});

// Get user stats
router.get('/me/stats', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

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
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get user stats charts data
router.get('/me/stats/charts', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

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
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// Get user by username
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    // Remove @ if present
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

    const user = await db.query.users.findFirst({
      where: eq(users.username, cleanUsername),
      with: {
        gym: true
      }
    });

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

// Update user profile
router.put('/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    // Remove @ if present
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

    const [updatedUser] = await db
      .update(users)
      .set(req.body)
      .where(eq(users.username, cleanUsername))
      .returning();

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(formatUserResponse(updatedUser));
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;