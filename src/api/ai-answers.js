import express from 'express';
import { supabase } from './supabaseClient.js';
import Groq from 'groq-sdk';
import { requireAuth } from './requireAuth.js';
const router = express.Router();

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// POST /api/ai-answers/generate - Generate AI answer for a question
router.post('/generate', requireAuth, async (req, res) => {
  const { question, questionId } = req.body;

  // Require authentication
  const userId = req.user?.sub;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!question || !questionId) {
    return res.status(400).json({ error: 'Question and questionId are required' });
  }

  try {
    // Measure processing time
    const start = Date.now();
    // Generate AI answer using Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // Fast and cost-effective model
      messages: [
        {
          role: "system",
          content: `You are a helpful expert on a professional networking platform. 
          Provide concise, accurate, and helpful answers to questions. 
          Keep answers under 200 words and focus on being practical and actionable.
          Format your response in a clear, professional manner.`
        },
        {
          role: "user",
          content: question
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });
    const end = Date.now();

    const aiAnswer = completion.choices[0].message.content;
    const model_used = completion.model || "llama3-8b-8192";
    const tokens_used = completion.usage?.total_tokens || null;
    const processing_time_ms = end - start;
    // Store the AI answer in the database with user_id and additional metadata
    const { data, error } = await supabase
      .from('ai_answers')
      .insert([
        {
          question_id: questionId,
          answer_text: aiAnswer,
          generated_by: 'groq',
          user_id: userId,
          model_used,
          tokens_used,
          processing_time_ms,
          user_feedback_rating: null,
          generation_attempts: 1
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error storing AI answer:', error);
      return res.status(500).json({ error: 'Failed to store AI answer', details: error.message, supabaseError: error });
    }

    res.json({
      success: true,
      aiAnswer: data,
      message: 'AI answer generated successfully'
    });

  } catch (error) {
    console.error('Error generating AI answer:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI answer',
      details: error.message 
    });
  }
});

// GET /api/ai-answers/:id - Get AI answer by its primary key
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('ai_answers')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }
  res.json({ aiAnswer: data || null });
});

// GET /api/ai-answers/question/:id - Get AI answer for a specific question
router.get('/question/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('ai_answers')
      .select('*')
      .eq('question_id', id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      return res.status(500).json({ error: error.message });
    }

    res.json({ aiAnswer: data || null });

  } catch (error) {
    console.error('Error fetching AI answer:', error);
    res.status(500).json({ error: 'Failed to fetch AI answer' });
  }
});

// PATCH /api/ai-answers/:id/feedback
router.patch('/:id/feedback', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { user_feedback_rating } = req.body;
  if (typeof user_feedback_rating !== 'number') {
    return res.status(400).json({ error: 'Invalid feedback rating' });
  }
  const { data, error } = await supabase
    .from('ai_answers')
    .update({ user_feedback_rating })
    .eq('id', id)
    .select()
    .single();
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ success: true, aiAnswer: data });
});

// Add a test route for GET /api/ai-answers
router.get('/', (req, res) => {
  res.json({ message: 'AI Answers API is working! Use POST /generate or GET /question/:id.' });
});

export default router; 