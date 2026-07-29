import 'dotenv/config';
import express from 'express';
import aiAnswersRouter from './ai-answers.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/ai-answers', aiAnswersRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || null,
  });
});

export default app;
