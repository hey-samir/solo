import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const username = req.params.username;
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      username: user.username,
      profilePhoto: user.profilePhoto,
      memberSince: user.memberSince,
      gymId: user.gymId
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/:username', getUserByUsername);

export default router;