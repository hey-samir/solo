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
    console.log('[Feedback API] Request received:', { sort });

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

    // Ensure we always return an array and format the data
    const formattedFeedback = (feedbackItems || []).map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      screenshotUrl: item.screenshot_url,
      createdAt: item.created_at,
      upvotes: item.upvotes,
      username: item.user?.username
    }));

    console.log('[Feedback API] Retrieved feedback:', {
      count: formattedFeedback.length,
      sample: formattedFeedback.slice(0, 2)
    });

    res.json(formattedFeedback);
  } catch (error) {
    console.error('[Feedback API] Error fetching feedback:', error);
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

    // Format the response consistently
    const formattedFeedback = feedbackWithUser[0] ? {
      id: feedbackWithUser[0].id,
      title: feedbackWithUser[0].title,
      description: feedbackWithUser[0].description,
      category: feedbackWithUser[0].category,
      screenshotUrl: feedbackWithUser[0].screenshot_url,
      createdAt: feedbackWithUser[0].created_at,
      upvotes: feedbackWithUser[0].upvotes,
      username: feedbackWithUser[0].user?.username
    } : null;

    res.status(201).json(formattedFeedback);
  } catch (error) {
    console.error('[Feedback API] Error submitting feedback:', error);
    res.status(500).json({ 
      error: "Oops! Something went wrong while submitting your feedback. Let's get you back on track." 
    });
  }
});

export default router;