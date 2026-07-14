import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { qk } from "@/shared/lib/queryKeys";
import type { AiAnswer } from "@/shared/types/db";
import { fetchAiAnswer, generateAiAnswer, sendAiAnswerFeedback } from "../api/aiAnswers";

export function useAiAnswer(questionId: number) {
  return useQuery({
    queryKey: qk.qa.aiAnswer(questionId),
    queryFn: () => fetchAiAnswer(questionId),
  });
}

export function useGenerateAiAnswer(questionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (question: string) => generateAiAnswer({ question, questionId }),
    onSuccess: (aiAnswer: AiAnswer) => {
      queryClient.setQueryData(qk.qa.aiAnswer(questionId), aiAnswer);
      toast({
        title: "AI answer generated!",
        description: "An AI-generated answer has been created for this question.",
      });
    },
  });
}

export function useAiAnswerFeedback(questionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: number; rating: 0 | 1 }) => sendAiAnswerFeedback(input),
    onSuccess: (aiAnswer: AiAnswer) => {
      queryClient.setQueryData(qk.qa.aiAnswer(questionId), aiAnswer);
      toast({ title: "Thanks for the feedback!" });
    },
  });
}
