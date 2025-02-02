import { Router } from 'express';
import { db } from '../db';
import { feedbacks, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import { Request, Response } from 'express';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads/screenshots';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get feedback items with optional sorting
router.get('/', async (req: Request, res: Response) => {
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

    // Ensure we always return an array
    res.json(feedbackItems || []);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ 
      error: "Oops! We're having trouble loading the feedback. Let's get you back on track." 
    });
  }
});

// Submit new feedback
router.post('/', upload.single('screenshot'), async (req: Request, res: Response) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Please log in to submit feedback.' });
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

    if (!feedback) {
      throw new Error('Failed to create feedback');
    }

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
    res.status(500).json({ 
      error: "Oops! Something went wrong while submitting your feedback. Let's get you back on track." 
    });
  }
});

export default router;