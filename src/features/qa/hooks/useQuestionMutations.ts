import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { qk } from "@/shared/lib/queryKeys";
import { createQuestion, deleteQuestion, updateQuestion } from "../api/questions";

/** Prefix that matches every qk.qa.questions(filters) key. */
export const questionsKeyPrefix = [...qk.qa.all, "questions"] as const;

export function useCreateQuestion() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { title: string; body: string; category: string | null; tags: string[] }) =>
      createQuestion({ ...input, userId: user!.id }),
    onSuccess: () => {
      toast({
        title: "Question posted!",
        description: "Your question has been published successfully.",
      });
      queryClient.invalidateQueries({ queryKey: questionsKeyPrefix });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuestion,
    onSuccess: () => {
      toast({ title: "Question updated" });
      queryClient.invalidateQueries({ queryKey: questionsKeyPrefix });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => {
      toast({ title: "Question deleted" });
      queryClient.invalidateQueries({ queryKey: qk.qa.all });
    },
  });
}
