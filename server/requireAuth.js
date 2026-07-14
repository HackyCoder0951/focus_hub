import jwt from 'jsonwebtoken';

// Server-only secret: must NOT use the VITE_ prefix (Vite inlines VITE_* vars
// into the client bundle if they are ever referenced from frontend code).
const SUPABASE_JWT_SECRET =
  process.env.SUPABASE_JWT_SECRET || process.env.VITE_SUPABASE_JWT_SECRET;

if (!SUPABASE_JWT_SECRET) {
  throw new Error('Missing SUPABASE_JWT_SECRET in .env.');
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const user = jwt.verify(token, SUPABASE_JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
