import 'dotenv/config';
import express from 'express';
import app from './index.js';

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running on http://localhost:8080' , timestamp: new Date().toISOString() ,requestId: req.headers['x-request-id'] || null });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
}); 