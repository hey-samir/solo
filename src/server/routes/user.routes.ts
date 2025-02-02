import { Router, Request, Response } from 'express';
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