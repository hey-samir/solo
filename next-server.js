/**
 * Custom Next.js Server Wrapper
 * This script provides a custom wrapper around Next.js to handle configuration issues
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Override problematic config options
process.env.NEXT_SKIP_INVALID_CONFIG = 'true';

// Create the Next.js app
const app = next({
  dev: process.env.NODE_ENV !== 'production',
  dir: process.cwd(),
  port: process.env.PORT || 5000,
  hostname: '0.0.0.0'
});

const handle = app.getRequestHandler();

// Start the server
app.prepare().then(() => {
  const port = parseInt(process.env.PORT || '5000', 10);
  
  createServer((req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      
      // Let Next.js handle the request
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch(err => {
  console.error('Error starting Next.js server:', err);
  process.exit(1);
});
