import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase configuration: set SUPABASE_URL and SUPABASE_ANON_KEY (or the VITE_-prefixed equivalents) in .env.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
