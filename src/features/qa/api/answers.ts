import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { Answer, AnswerWithAuthor } from "@/shared/types/db";

/** Fetch answers for a question with author profiles, accepted first. */
export async function fetchAnswers(questionId: number): Promise<AnswerWithAuthor[]> {
  const rows = (await unwrap(
    supabase
      .from("answers")
      .select(`*, profiles:user_id(id, full_name, avatar_url)`)
      .eq("question_id", questionId)
      .order("is_accepted", { ascending: false })
      .order("created_at", { ascending: true })
  )) as unknown as AnswerWithAuthor[];
  return rows ?? [];
}

export async function createAnswer(input: {
  questionId: number;
  userId: string;
  body: string;
}): Promise<Answer> {
  return (await unwrap(
    supabase
      .from("answers")
      .insert({
        question_id: input.questionId,
        user_id: input.userId,
        body: input.body.trim(),
      })
      .select()
      .single()
  )) as Answer;
}

export async function updateAnswer(input: { id: number; body: string }): Promise<void> {
  await unwrap(
    supabase.from("answers").update({ body: input.body.trim() }).eq("id", input.id).select("id")
  );
}

export async function deleteAnswer(id: number): Promise<void> {
  await unwrap(supabase.from("answers").delete().eq("id", id).select("id"));
}

/**
 * Accept an answer. Keeps `answers.is_accepted` and
 * `questions.best_answer_id` in sync (the old implementation only set the
 * flag, so the "Answered" badge driven by best_answer_id never appeared).
 */
export async function acceptAnswer(input: {
  questionId: number;
  answerId: number;
}): Promise<void> {
  // Clear any previously accepted answer for this question.
  await unwrap(
    supabase
      .from("answers")
      .update({ is_accepted: false })
      .eq("question_id", input.questionId)
      .neq("id", input.answerId)
      .select("id")
  );

  await unwrap(
    supabase.from("answers").update({ is_accepted: true }).eq("id", input.answerId).select("id")
  );

  await unwrap(
    supabase
      .from("questions")
      .update({ best_answer_id: input.answerId })
      .eq("id", input.questionId)
      .select("id")
  );
}
