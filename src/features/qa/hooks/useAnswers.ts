import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { qk } from "@/shared/lib/queryKeys";
import {
  acceptAnswer,
  createAnswer,
  deleteAnswer,
  fetchAnswers,
  updateAnswer,
} from "../api/answers";
import { questionsKeyPrefix } from "./useQuestionMutations";

export function useAnswers(questionId: number | null) {
  return useQuery({
    queryKey: qk.qa.answers(questionId ?? -1),
    queryFn: () => fetchAnswers(questionId!),
    enabled: questionId != null,
  });
}

export function useCreateAnswer(questionId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => createAnswer({ questionId, userId: user!.id, body }),
    onSuccess: () => {
      toast({ title: "Answer posted!", description: "Your answer has been published." });
      queryClient.invalidateQueries({ queryKey: qk.qa.answers(questionId) });
      // answer_count on the cards comes from the questions query
      queryClient.invalidateQueries({ queryKey: questionsKeyPrefix });
    },
  });
}

export function useUpdateAnswer(questionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.qa.answers(questionId) });
    },
  });
}

export function useDeleteAnswer(questionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnswer,
    onSuccess: () => {
      toast({ title: "Answer deleted" });
      queryClient.invalidateQueries({ queryKey: qk.qa.answers(questionId) });
      queryClient.invalidateQueries({ queryKey: questionsKeyPrefix });
    },
  });
}

export function useAcceptAnswer(questionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answerId: number) => acceptAnswer({ questionId, answerId }),
    onSuccess: () => {
      toast({ title: "Answer accepted", description: "Marked as the best answer." });
      queryClient.invalidateQueries({ queryKey: qk.qa.answers(questionId) });
      // best_answer_id lives on the question row
      queryClient.invalidateQueries({ queryKey: questionsKeyPrefix });
    },
  });
}
