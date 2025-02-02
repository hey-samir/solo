import { Router, Request, Response } from 'express';
import { db } from '../db';
import { feedback, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadDir = 'uploads/screenshots';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = Router();

interface AuthenticatedRequest extends Request {
  user?: any;
}

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
      id: feedback.id,
      title: feedback.title,
      description: feedback.description,
      category: feedback.category,
      screenshot_url: feedback.screenshot_url,
      created_at: feedback.created_at,
      upvotes: feedback.upvotes,
      user: {
        username: users.username
      }
    })
    .from(feedback)
    .leftJoin(users, eq(feedback.user_id, users.id))
    .orderBy(sort === 'new' ? desc(feedback.created_at) : desc(feedback.upvotes));

    res.json(feedbackItems || []);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ 
      error: "Oops! We're having trouble loading the feedback. Let's get you back on track." 
    });
  }
});

// Submit new feedback
router.post('/', upload.single('screenshot'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Please log in to submit feedback.' });
      return;
    }

    const [feedbackItem] = await db.insert(feedback)
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

    if (!feedbackItem) {
      throw new Error('Failed to create feedback');
    }

    const feedbackWithUser = await db.select({
      id: feedback.id,
      title: feedback.title,
      description: feedback.description,
      category: feedback.category,
      screenshot_url: feedback.screenshot_url,
      created_at: feedback.created_at,
      upvotes: feedback.upvotes,
      user: {
        username: users.username
      }
    })
    .from(feedback)
    .leftJoin(users, eq(feedback.user_id, users.id))
    .where(eq(feedback.id, feedbackItem.id))
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