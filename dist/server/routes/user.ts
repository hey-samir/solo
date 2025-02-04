import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, gyms } from '../db/schema';
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

// Get user by username
const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
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
};

// Get current user route
router.get('/current', async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
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

    res.json(formatUserResponse(user));
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by username
router.get('/:username', getUserByUsername);

export default router;