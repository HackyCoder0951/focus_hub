import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { PostComment, Profile } from "@/shared/types/db";

/** Comment row joined with its author and aggregated like count. */
export type CommentWithAuthor = PostComment & {
  profiles: Pick<Profile, "full_name" | "avatar_url"> | null;
  comment_likes: { count: number }[] | null;
};

const COMMENT_SELECT = `
  *,
  profiles:profiles(full_name, avatar_url),
  comment_likes(count)
`;

export async function fetchComments(postId: string): Promise<CommentWithAuthor[]> {
  const rows = await unwrap(
    supabase
      .from("comments")
      .select(COMMENT_SELECT)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
  );
  return (rows ?? []) as unknown as CommentWithAuthor[];
}

export async function addComment(input: {
  postId: string;
  userId: string;
  content: string;
  parentId?: string | null;
}): Promise<void> {
  await unwrap(
    supabase.from("comments").insert({
      post_id: input.postId,
      user_id: input.userId,
      content: input.content,
      parent_id: input.parentId ?? null,
    })
  );
}

export async function updateComment(id: string, content: string): Promise<void> {
  await unwrap(supabase.from("comments").update({ content }).eq("id", id));
}

export async function deleteComment(id: string): Promise<void> {
  await unwrap(supabase.from("comments").delete().eq("id", id));
}

/** IDs (from `commentIds`) of comments the user has liked. */
export async function fetchMyLikedCommentIds(
  commentIds: string[],
  userId: string
): Promise<string[]> {
  if (commentIds.length === 0) return [];
  const rows = await unwrap(
    supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", userId)
      .in("comment_id", commentIds)
  );
  return (rows ?? [])
    .map((row) => row.comment_id)
    .filter((id): id is string => Boolean(id));
}

/**
 * Toggles a like on a comment.
 * `liked` is the CURRENT state — true removes the like, false adds it.
 */
export async function toggleCommentLike(
  commentId: string,
  userId: string,
  liked: boolean
): Promise<void> {
  if (liked) {
    await unwrap(
      supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", userId)
    );
  } else {
    await unwrap(
      supabase.from("comment_likes").insert({ comment_id: commentId, user_id: userId })
    );
  }
}
