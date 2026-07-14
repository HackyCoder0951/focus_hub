import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { Question, QuestionWithAuthor, ProfileLite } from "@/shared/types/db";

/** Question row as rendered in the Q&A list: author + answer count + tags. */
export type QaQuestion = QuestionWithAuthor & { tags: string[] };

export interface QuestionFilters {
  category?: string;
  search?: string;
}

export const QA_CATEGORIES = ["React", "JavaScript", "Python", "Design", "Career"] as const;

type QuestionJoinRow = Question & {
  profiles: ProfileLite | null;
  answers: { count: number }[] | null;
  question_tags: { tag_name: string }[] | null;
};

/**
 * Fetch questions with author profile, answer count (LEFT join so
 * unanswered questions are included) and tag names. Search and category
 * filtering happen server-side.
 */
export async function fetchQuestions(filters: QuestionFilters = {}): Promise<QaQuestion[]> {
  let query = supabase.from("questions").select(
    `*,
     profiles:user_id(id, full_name, avatar_url),
     answers(count),
     question_tags(tag_name)`
  );

  if (filters.category && filters.category !== "All") {
    query = query.eq("category", filters.category);
  }

  const term = filters.search?.trim().replace(/[%,()]/g, " ").trim();
  if (term) {
    query = query.or(`title.ilike.%${term}%,body.ilike.%${term}%`);
  }

  const rows = (await unwrap(
    query.order("created_at", { ascending: false })
  )) as unknown as QuestionJoinRow[];

  return (rows ?? []).map((row) => ({
    ...row,
    profiles: row.profiles ?? null,
    answer_count: row.answers?.[0]?.count ?? 0,
    tags: (row.question_tags ?? []).map((t) => t.tag_name),
  }));
}

export interface CreateQuestionInput {
  userId: string;
  title: string;
  body: string;
  category: string | null;
  tags: string[];
}

/**
 * The `tags` catalog table exists in the database but is missing from the
 * generated Supabase types, so its upsert goes through an untyped client.
 * `question_tags` (typed) stores the actual question<->tag link by name.
 */
const untypedClient = supabase as unknown as SupabaseClient;

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 30);
    if (tag && !seen.has(tag)) {
      seen.add(tag);
      result.push(tag);
    }
  }
  return result.slice(0, 5);
}

async function linkTags(questionId: number, tags: string[]): Promise<void> {
  // Best-effort upsert into the tags catalog (unique on name).
  await untypedClient
    .from("tags")
    .upsert(
      tags.map((name) => ({ name })),
      { onConflict: "name", ignoreDuplicates: true }
    );

  await unwrap(
    supabase.from("question_tags").upsert(
      tags.map((tag_name) => ({ question_id: questionId, tag_name })),
      { onConflict: "question_id,tag_name", ignoreDuplicates: true }
    )
  );
}

export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  const created = (await unwrap(
    supabase
      .from("questions")
      .insert({
        user_id: input.userId,
        title: input.title.trim(),
        body: input.body.trim(),
        category: input.category,
      })
      .select()
      .single()
  )) as Question;

  const tags = normalizeTags(input.tags);
  if (tags.length > 0 && created?.id) {
    await linkTags(created.id, tags);
  }

  return created;
}

export async function updateQuestion(input: {
  id: number;
  title: string;
  body: string;
}): Promise<void> {
  await unwrap(
    supabase
      .from("questions")
      .update({ title: input.title.trim(), body: input.body.trim() })
      .eq("id", input.id)
      .select("id")
  );
}

export async function deleteQuestion(id: number): Promise<void> {
  await unwrap(supabase.from("questions").delete().eq("id", id).select("id"));
}
