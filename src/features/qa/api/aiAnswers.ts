import { apiFetch } from "@/lib/api";
import type { AiAnswer } from "@/shared/types/db";

/** GET /api/ai-answers/question/:id — null when none exists yet. */
export async function fetchAiAnswer(questionId: number): Promise<AiAnswer | null> {
  const res = await apiFetch<{ aiAnswer: AiAnswer | null }>(
    `/api/ai-answers/question/${questionId}`
  );
  return res.aiAnswer ?? null;
}

/** POST /api/ai-answers/generate — generates (or regenerates) the AI answer. */
export async function generateAiAnswer(input: {
  question: string;
  questionId: number;
}): Promise<AiAnswer> {
  const res = await apiFetch<{ aiAnswer: AiAnswer }>("/api/ai-answers/generate", {
    method: "POST",
    body: JSON.stringify({ question: input.question, questionId: input.questionId }),
  });
  return res.aiAnswer;
}

/** PATCH /api/ai-answers/:id/feedback — 1 = helpful, 0 = not helpful. */
export async function sendAiAnswerFeedback(input: {
  id: number;
  rating: 0 | 1;
}): Promise<AiAnswer> {
  const res = await apiFetch<{ aiAnswer: AiAnswer }>(`/api/ai-answers/${input.id}/feedback`, {
    method: "PATCH",
    body: JSON.stringify({ user_feedback_rating: input.rating }),
  });
  return res.aiAnswer;
}
