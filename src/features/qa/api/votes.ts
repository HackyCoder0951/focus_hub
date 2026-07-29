import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";

export type VoteValue = 1 | -1;

/** All vote scores plus the current user's own votes, keyed by target id. */
export interface VoteAggregates {
  scores: Record<number, number>;
  userVotes: Record<number, VoteValue>;
}

interface VoteRow {
  target_id: number;
  user_id: string;
  vote_value: number;
}

export function aggregate(rows: VoteRow[], userId?: string): VoteAggregates {
  const scores: Record<number, number> = {};
  const userVotes: Record<number, VoteValue> = {};
  for (const row of rows) {
    scores[row.target_id] = (scores[row.target_id] ?? 0) + row.vote_value;
    if (userId && row.user_id === userId && (row.vote_value === 1 || row.vote_value === -1)) {
      userVotes[row.target_id] = row.vote_value;
    }
  }
  return { scores, userVotes };
}

/** One query pass over question_votes: totals + the current user's votes. */
export async function fetchQuestionVoteAggregates(userId?: string): Promise<VoteAggregates> {
  const rows = (await unwrap(
    supabase.from("question_votes").select("question_id, user_id, vote_value")
  )) as unknown as { question_id: number; user_id: string; vote_value: number }[];

  return aggregate(
    (rows ?? []).map((r) => ({ target_id: r.question_id, user_id: r.user_id, vote_value: r.vote_value })),
    userId
  );
}

/** Vote aggregates for every answer belonging to a question. */
export async function fetchAnswerVoteAggregates(
  questionId: number,
  userId?: string
): Promise<VoteAggregates> {
  const rows = (await unwrap(
    supabase
      .from("answer_votes")
      .select("answer_id, user_id, vote_value, answers!inner(question_id)")
      .eq("answers.question_id", questionId)
  )) as unknown as { answer_id: number; user_id: string; vote_value: number }[];

  return aggregate(
    (rows ?? []).map((r) => ({ target_id: r.answer_id, user_id: r.user_id, vote_value: r.vote_value })),
    userId
  );
}

/**
 * Toggle/switch vote semantics:
 * - same direction again -> the vote row is deleted (vote removed)
 * - opposite direction   -> the row is updated to the new direction
 * - no previous vote     -> a row is inserted
 * (The old implementation only ever upserted and permanently disabled the
 * buttons after one vote.)
 */
export async function castQuestionVote(input: {
  questionId: number;
  userId: string;
  direction: VoteValue;
  previous?: VoteValue;
}): Promise<void> {
  if (input.previous === input.direction) {
    await unwrap(
      supabase
        .from("question_votes")
        .delete()
        .eq("question_id", input.questionId)
        .eq("user_id", input.userId)
        .select("id")
    );
    return;
  }
  await unwrap(
    supabase
      .from("question_votes")
      .upsert(
        { question_id: input.questionId, user_id: input.userId, vote_value: input.direction },
        { onConflict: "question_id,user_id" }
      )
      .select("id")
  );
}

export async function castAnswerVote(input: {
  answerId: number;
  userId: string;
  direction: VoteValue;
  previous?: VoteValue;
}): Promise<void> {
  if (input.previous === input.direction) {
    await unwrap(
      supabase
        .from("answer_votes")
        .delete()
        .eq("answer_id", input.answerId)
        .eq("user_id", input.userId)
        .select("id")
    );
    return;
  }
  await unwrap(
    supabase
      .from("answer_votes")
      .upsert(
        { answer_id: input.answerId, user_id: input.userId, vote_value: input.direction },
        { onConflict: "answer_id,user_id" }
      )
      .select("id")
  );
}
