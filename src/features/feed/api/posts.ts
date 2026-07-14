import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { PostWithAuthor } from "@/shared/types/db";

export const PAGE_SIZE = 10;

/**
 * Post row as rendered in the feed: joined author profile plus the
 * aggregated like count. `image_url` / `file_url` exist on the live table
 * but are missing from the generated types, so they are added here.
 */
export type FeedPost = PostWithAuthor & {
  image_url?: string | null;
  file_url?: string | null;
  likes_count?: number;
};

type RawFeedPost = Omit<FeedPost, "likes_count"> & {
  likes_count: { count: number }[] | null;
};

const FEED_SELECT = `
  *,
  profiles:profiles(full_name, avatar_url, email),
  likes_count:likes(count)
`;

export async function fetchPostsPage({
  pageParam = 0,
  search = "",
}: {
  pageParam?: number;
  search?: string;
}): Promise<FeedPost[]> {
  const from = pageParam * PAGE_SIZE;

  let query = supabase
    .from("posts")
    .select(FEED_SELECT)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  // Strip characters that would break the PostgREST `or` filter syntax.
  const term = search.trim().replace(/[,()]/g, " ").trim();
  if (term) {
    query = query.or(`content.ilike.%${term}%`);
  }

  const rows = (await unwrap(query)) as unknown as RawFeedPost[];

  return (rows ?? []).map((row) => ({
    ...row,
    likes_count: row.likes_count?.[0]?.count ?? 0,
  }));
}

export async function createPost(input: {
  userId: string;
  content: string;
  imageUrl?: string | null;
}): Promise<void> {
  await unwrap(
    supabase.from("posts").insert({
      user_id: input.userId,
      content: input.content,
      image_url: input.imageUrl ?? null,
    })
  );
}

export async function updatePost(id: string, content: string): Promise<void> {
  await unwrap(
    supabase
      .from("posts")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", id)
  );
}

/** Soft delete: keeps the row but hides it from every feed query. */
export async function softDeletePost(id: string): Promise<void> {
  await unwrap(
    supabase
      .from("posts")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", id)
  );
}

/** Uploads an image to the `post-media` bucket and returns its public URL. */
export async function uploadPostImage(file: File): Promise<string> {
  const path = `images/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("post-media")
    .upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: publicUrlData } = supabase.storage
    .from("post-media")
    .getPublicUrl(data.path);
  return publicUrlData.publicUrl;
}
