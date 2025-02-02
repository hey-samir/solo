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

// Define the feedback item type
type FeedbackItem = {
  id: number;
  title: string;
  description: string;
  category: string;
  screenshot_url: string | null;
  created_at: Date | null;
  upvotes: number;
  user: {
    username: string | null;
  } | null;
};

// Get feedback items with optional sorting
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sort = 'new' } = req.query;
    console.log('[Feedback API] Request received:', { sort });

    const results = await db
      .select({
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

    // Ensure we have a valid array and process the data
    const feedbackData = (results || []).map((item: FeedbackItem) => ({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'general',
      screenshotUrl: item.screenshot_url,
      createdAt: item.created_at,
      upvotes: item.upvotes || 0,
      username: item.user?.username || 'Anonymous'
    }));

    console.log('[Feedback API] Processed data:', {
      resultCount: results?.length || 0,
      outputCount: feedbackData.length,
      sample: feedbackData[0] || null
    });

    return res.json(feedbackData);
  } catch (error) {
    console.error('[Feedback API] Error:', error);
    return res.status(500).json({ 
      error: "Failed to fetch feedback",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Submit new feedback
router.post('/', upload.single('screenshot'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      console.log('[Feedback API] Unauthorized access attempt');
      return res.status(401).json({ error: 'Please log in to submit feedback.' });
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

    console.log('[Feedback API] Created new feedback:', formattedFeedback);
    res.status(201).json(formattedFeedback);
  } catch (error) {
    console.error('[Feedback API] Error submitting feedback:', error);
    res.status(500).json({ 
      error: "Oops! Something went wrong while submitting your feedback. Let's get you back on track." 
    });
  }
});

export default router;