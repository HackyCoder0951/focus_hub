import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import aiAnswersRouter from './ai-answers.js';

const app = express();

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:8080',
  'https://focus-hub-two.vercel.app',
];

const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : DEFAULT_ORIGINS;

app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

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
