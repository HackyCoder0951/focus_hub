import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { AnswerComment, ProfileLite } from "@/shared/types/db";

export type CommentWithAuthor = AnswerComment & { profiles: ProfileLite | null };

export type CommentNode = CommentWithAuthor & { replies: CommentNode[] };

export async function fetchAnswerComments(answerId: number): Promise<CommentWithAuthor[]> {
  const rows = (await unwrap(
    supabase
      .from("answer_comments")
      .select(`*, profiles:user_id(id, full_name, avatar_url)`)
      .eq("answer_id", answerId)
      .order("created_at", { ascending: true })
  )) as unknown as CommentWithAuthor[];
  return rows ?? [];
}

export async function createComment(input: {
  answerId: number;
  userId: string;
  body: string;
  parentCommentId?: number | null;
}): Promise<void> {
  await unwrap(
    supabase
      .from("answer_comments")
      .insert({
        answer_id: input.answerId,
        user_id: input.userId,
        body: input.body.trim(),
        parent_comment_id: input.parentCommentId ?? null,
      })
      .select("id")
  );
}

export async function deleteComment(id: number): Promise<void> {
  await unwrap(supabase.from("answer_comments").delete().eq("id", id).select("id"));
}

/** Turn a flat comment list into a nested reply tree (orphans become roots). */
export function buildCommentTree(comments: CommentWithAuthor[]): CommentNode[] {
  const byId = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  for (const comment of comments) {
    byId.set(comment.id, { ...comment, replies: [] });
  }
  for (const comment of comments) {
    const node = byId.get(comment.id)!;
    const parent = comment.parent_comment_id ? byId.get(comment.parent_comment_id) : undefined;
    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
