import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";

/** Whether `userId` has liked `postId`. */
export async function fetchIsLiked(postId: string, userId: string): Promise<boolean> {
  const rows = await unwrap(
    supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .limit(1)
  );
  return (rows?.length ?? 0) > 0;
}

/**
 * Toggles the like row for a post.
 * `liked` is the CURRENT state — true removes the like, false adds it.
 */
export async function toggleLike(
  postId: string,
  userId: string,
  liked: boolean
): Promise<void> {
  if (liked) {
    await unwrap(
      supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId)
    );
  } else {
    await unwrap(supabase.from("likes").insert({ post_id: postId, user_id: userId }));
  }
}
