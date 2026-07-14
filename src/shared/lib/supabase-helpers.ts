import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Unwraps a supabase-js response: throws on error, returns typed data.
 * Replaces the copy-pasted `if (error) { ... }` blocks around every query.
 *
 *   const posts = await unwrap(supabase.from("posts").select("*"));
 */
export async function unwrap<T>(
  query: PromiseLike<{ data: T | null; error: PostgrestError | null }>
): Promise<T> {
  const { data, error } = await query;
  if (error) throw error;
  return data as T;
}

/**
 * Like unwrap, but treats "no rows" (.single() PGRST116) as null
 * instead of an error.
 */
export async function unwrapMaybe<T>(
  query: PromiseLike<{ data: T | null; error: PostgrestError | null }>
): Promise<T | null> {
  const { data, error } = await query;
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}
