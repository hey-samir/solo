import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, gyms } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = req.params.username;
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      with: {
        gym: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      profilePhoto: user.profilePhoto,
      memberSince: user.memberSince,
      gymId: user.gymId,
      gym: user.gym
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user route
router.get('/current', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
      with: {
        gym: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      profilePhoto: user.profilePhoto,
      memberSince: user.memberSince,
      gymId: user.gymId,
      gym: user.gym
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:username', getUserByUsername);

export default router;