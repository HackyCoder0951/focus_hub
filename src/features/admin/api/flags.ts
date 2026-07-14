import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { ContentFlag, Post, Profile } from "@/shared/types/db";

/**
 * Status filter for the flags list:
 * - "pending"  → open flags (status = 'pending' or null)
 * - "resolved" / "dismissed" → that exact status
 * - "history"  → resolved + dismissed (Reports tab)
 * - "all"      → everything
 */
export type FlagStatusFilter = "pending" | "resolved" | "dismissed" | "history" | "all";

type FlaggedPost = Pick<Post, "id" | "content" | "user_id" | "is_deleted">;
type FlagProfile = Pick<Profile, "id" | "full_name" | "email">;

/** A content flag joined client-side with its post, reporter and post author. */
export interface FlagWithContent {
  flag: ContentFlag;
  post: FlaggedPost | null;
  reporter: FlagProfile | null;
  author: FlagProfile | null;
}

export async function fetchFlags(status: FlagStatusFilter): Promise<FlagWithContent[]> {
  let query = supabase
    .from("content_flags")
    .select("*")
    .order("created_at", { ascending: false });

  if (status === "pending") {
    query = query.or("status.eq.pending,status.is.null");
  } else if (status === "history") {
    query = query.in("status", ["resolved", "dismissed"]);
  } else if (status !== "all") {
    query = query.eq("status", status);
  }

  const flags: ContentFlag[] = (await unwrap(query)) ?? [];
  if (flags.length === 0) return [];

  const postIds = [
    ...new Set(flags.map((f) => f.post_id).filter((id): id is string => Boolean(id))),
  ];
  const posts: FlaggedPost[] = postIds.length
    ? (await unwrap(
        supabase.from("posts").select("id, content, user_id, is_deleted").in("id", postIds)
      )) ?? []
    : [];

  const profileIds = [
    ...new Set([
      ...flags.map((f) => f.flagged_by_user_id),
      ...posts.map((p) => p.user_id),
    ]),
  ].filter((id): id is string => Boolean(id));
  const profiles: FlagProfile[] = profileIds.length
    ? (await unwrap(
        supabase.from("profiles").select("id, full_name, email").in("id", profileIds)
      )) ?? []
    : [];

  const postById = new Map(posts.map((p) => [p.id, p]));
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  return flags.map((flag) => {
    const post = flag.post_id ? postById.get(flag.post_id) ?? null : null;
    return {
      flag,
      post,
      reporter: profileById.get(flag.flagged_by_user_id) ?? null,
      author: post?.user_id ? profileById.get(post.user_id) ?? null : null,
    };
  });
}

export type FlagAction = "dismiss" | "remove";

/**
 * Resolves a flag:
 * - "dismiss" → flag status = 'dismissed'
 * - "remove"  → posts.is_deleted = true and flag status = 'resolved'
 * Either way the flagged post is marked reviewed (legacy side effect).
 */
export async function resolveFlag(flag: ContentFlag, action: FlagAction): Promise<void> {
  if (action === "remove" && flag.post_id) {
    const { error: postError } = await supabase
      .from("posts")
      .update({ is_deleted: true })
      .eq("id", flag.post_id);
    if (postError) throw postError;
  }

  const { error } = await supabase
    .from("content_flags")
    .update({ status: action === "remove" ? "resolved" : "dismissed" })
    .eq("id", flag.id);
  if (error) throw error;

  if (flag.post_id) {
    const { error: reviewError } = await supabase
      .from("posts")
      .update({ flag_status: "reviewed" })
      .eq("id", flag.post_id);
    if (reviewError) throw reviewError;
  }
}
