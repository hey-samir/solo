import { Router } from 'express';
import { db } from '../db';
import { feedbacks, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/screenshots/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get feedback items with optional sorting
router.get('/', async (req, res) => {
  try {
    const { sort = 'new' } = req.query;

    const feedbackItems = await db.select({
      id: feedbacks.id,
      title: feedbacks.title,
      description: feedbacks.description,
      category: feedbacks.category,
      screenshot_url: feedbacks.screenshot_url,
      created_at: feedbacks.created_at,
      upvotes: feedbacks.upvotes,
      user: {
        username: users.username
      }
    })
    .from(feedbacks)
    .leftJoin(users, eq(feedbacks.user_id, users.id))
    .orderBy(sort === 'new' ? desc(feedbacks.created_at) : desc(feedbacks.upvotes));

    res.json(feedbackItems);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit new feedback
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [feedback] = await db.insert(feedbacks)
      .values({
        title,
        description,
        category,
        user_id: userId,
        screenshot_url: req.file?.path,
        upvotes: 0,
        created_at: new Date()
      })
      .returning();

    const feedbackWithUser = await db.select({
      id: feedbacks.id,
      title: feedbacks.title,
      description: feedbacks.description,
      category: feedbacks.category,
      screenshot_url: feedbacks.screenshot_url,
      created_at: feedbacks.created_at,
      upvotes: feedbacks.upvotes,
      user: {
        username: users.username
      }
    })
    .from(feedbacks)
    .leftJoin(users, eq(feedbacks.user_id, users.id))
    .where(eq(feedbacks.id, feedback.id))
    .limit(1);

    res.status(201).json(feedbackWithUser[0]);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;