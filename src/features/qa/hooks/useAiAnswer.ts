import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { ApiError } from "@/lib/api";
import { qk } from "@/shared/lib/queryKeys";
import type { AiAnswer } from "@/shared/types/db";
import { fetchAiAnswer, generateAiAnswer, sendAiAnswerFeedback } from "../api/aiAnswers";

function aiAnswerErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Network error. Please check your connection and try again.";
}

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
    onError: (error) => {
      toast({
        title: "Couldn't generate AI answer",
        description: aiAnswerErrorMessage(error),
        variant: "destructive",
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
    onError: (error) => {
      toast({
        title: "Couldn't send feedback",
        description: aiAnswerErrorMessage(error),
        variant: "destructive",
      });
    },
  });
}
