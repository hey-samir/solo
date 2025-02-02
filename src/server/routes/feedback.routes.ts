import { Router, Request, Response } from 'express';
import { db } from '../db';
import { feedback, users } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'screenshots');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get feedback items with optional sorting
router.get('/', async (req: Request, res: Response) => {
  try {
    const { sort = 'new' } = req.query;
    console.log('[Feedback API] GET request received:', { 
      sort,
      headers: req.headers,
      path: req.path 
    });

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

    console.log('[Feedback API] Query completed:', {
      resultCount: results?.length || 0
    });

    const feedbackData = results.map(item => ({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'general',
      screenshotUrl: item.screenshot_url,
      createdAt: item.created_at,
      upvotes: item.upvotes || 0,
      username: item.user?.username || 'Anonymous'
    }));

    console.log('[Feedback API] Sending response:', {
      dataCount: feedbackData.length,
      sample: feedbackData[0]
    });

    res.json(feedbackData);
  } catch (error) {
    console.error('[Feedback API] Error in GET route:', error);
    res.status(500).json({ 
      error: "Failed to fetch feedback",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Submit new feedback
router.post('/', upload.single('screenshot'), async (req: AuthenticatedRequest, res: Response) => {
  console.log('[Feedback API] POST request received:', {
    body: req.body,
    file: req.file,
    user: req.user?.id
  });

  try {
    const { title, description, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      console.log('[Feedback API] Unauthorized access attempt');
      return res.status(401).json({ error: 'Please log in to submit feedback.' });
    }

    const [newFeedback] = await db.insert(feedback)
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

    console.log('[Feedback API] Created feedback:', newFeedback);

    res.status(201).json({
      id: newFeedback.id,
      title: newFeedback.title,
      description: newFeedback.description,
      category: newFeedback.category,
      screenshotUrl: newFeedback.screenshot_url,
      createdAt: newFeedback.created_at,
      upvotes: newFeedback.upvotes,
      username: req.user?.username || 'Anonymous'
    });
  } catch (error) {
    console.error('[Feedback API] Error in POST route:', error);
    res.status(500).json({ 
      error: "Failed to submit feedback",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;