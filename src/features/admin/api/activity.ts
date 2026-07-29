import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";

export type ActivityType = "post" | "question" | "file" | "user";

export interface ActivityItem {
  /** Stable list key — ids can collide across tables. */
  key: string;
  type: ActivityType;
  description: string;
  createdAt: string;
}

const LIMIT = 10;

export function excerpt(text: string, max = 80): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/**
 * Latest platform events: union of recent posts, questions, file uploads
 * and signups (4 small queries), merged and sorted client-side.
 */
export async function fetchRecentActivity(): Promise<ActivityItem[]> {
  const [posts, questions, files, users] = await Promise.all([
    unwrap(
      supabase
        .from("posts")
        .select("id, content, created_at")
        .order("created_at", { ascending: false })
        .limit(LIMIT)
    ),
    unwrap(
      supabase
        .from("questions")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(LIMIT)
    ),
    unwrap(
      supabase
        .from("filemodels")
        .select("id, file_name, created_at")
        .order("created_at", { ascending: false })
        .limit(LIMIT)
    ),
    unwrap(
      supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(LIMIT)
    ),
  ]);

  const items: ActivityItem[] = [
    ...(posts ?? []).map((p) => ({
      key: `post-${p.id}`,
      type: "post" as const,
      description: `New post: ${excerpt(p.content)}`,
      createdAt: p.created_at,
    })),
    ...(questions ?? []).map((q) => ({
      key: `question-${q.id}`,
      type: "question" as const,
      description: `New question: ${excerpt(q.title)}`,
      createdAt: q.created_at,
    })),
    ...(files ?? []).map((f) => ({
      key: `file-${f.id}`,
      type: "file" as const,
      description: `File uploaded: ${excerpt(f.file_name)}`,
      createdAt: f.created_at,
    })),
    ...(users ?? []).map((u) => ({
      key: `user-${u.id}`,
      type: "user" as const,
      description: `New member: ${u.full_name || u.email}`,
      createdAt: u.created_at,
    })),
  ];

  return items
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, LIMIT);
}
