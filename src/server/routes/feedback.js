const express = require('express');
const { createClient } = require('@vercel/postgres');
const router = express.Router();

// Get feedback items
router.get('/', async (req, res) => {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('[Feedback API] Connected to database, fetching feedback...');
    
    const sort = req.query.sort || 'new';
    const query = `
      SELECT 
        f.id,
        f.title,
        f.description,
        f.category,
        f.screenshot_url,
        f.created_at,
        u.username
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      ORDER BY ${sort === 'new' ? 'f.created_at DESC' : 'f.votes DESC, f.created_at DESC'}
      LIMIT 100
    `;

    const result = await client.query(query);
    const feedback = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      screenshot_url: row.screenshot_url,
      created_at: row.created_at,
      user: {
        username: row.username || 'Anonymous'
      }
    }));

    res.json(feedback);
  } catch (error) {
    console.error('[Feedback API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch feedback',
      details: error.message
    });
  } finally {
    await client.end().catch(console.error);
  }
});

// Submit new feedback
router.post('/', async (req, res) => {
  const client = createClient({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('[Feedback API] Connected to database, submitting feedback...');
    
    const { title, description, category } = req.body;
    
    // For now, we'll create feedback without user association
    const query = `
      INSERT INTO feedback (title, description, category, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id, title, description, category, created_at
    `;

    const result = await client.query(query, [title, description, category]);
    const feedback = {
      ...result.rows[0],
      user: {
        username: 'Anonymous'
      }
    };

    res.status(201).json(feedback);
  } catch (error) {
    console.error('[Feedback API] Error:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: error.message
    });
  } finally {
    await client.end().catch(console.error);
  }
});

module.exports = router;
