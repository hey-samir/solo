const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const STATIC_DIR = path.join(process.cwd(), 'dist/staging');

app.use(express.static(STATIC_DIR));

app.get('/api/feature-flags', (req, res) => {
  res.json({
    enableFeedback: true,
    enableProfileEditing: true,
    enableSoloMode: true
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'staging.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
