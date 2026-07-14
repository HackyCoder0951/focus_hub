import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import { fetchQuestions, type QaQuestion } from "../api/questions";
import { useQuestionVotes } from "./useVotes";

export type QaTab = "recent" | "trending" | "unanswered";

const MS_PER_DAY = 86_400_000;

/** Trending: voteScore * 2 + answerCount * 3 + recencyBoost(<= 10). */
export function trendingScore(question: QaQuestion, voteScore: number): number {
  const ageInDays = Math.max(0, Date.now() - new Date(question.created_at).getTime()) / MS_PER_DAY;
  const recencyBoost = Math.max(0, 10 - ageInDays);
  return voteScore * 2 + question.answer_count * 3 + recencyBoost;
}

export function useQuestions({
  tab,
  category,
  search,
}: {
  tab: QaTab;
  category: string;
  search: string;
}) {
  const { scores } = useQuestionVotes();

  const query = useQuery({
    queryKey: qk.qa.questions({ category, search }),
    queryFn: () => fetchQuestions({ category, search }),
    placeholderData: keepPreviousData,
  });

  const questions = useMemo<QaQuestion[]>(() => {
    const list = query.data ?? [];
    switch (tab) {
      case "unanswered":
        return list.filter((q) => q.answer_count === 0);
      case "trending":
        return [...list].sort(
          (a, b) => trendingScore(b, scores[b.id] ?? 0) - trendingScore(a, scores[a.id] ?? 0)
        );
      default:
        return list;
    }
  }, [query.data, scores, tab]);

  return {
    questions,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
