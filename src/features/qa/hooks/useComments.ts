import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { qk } from "@/shared/lib/queryKeys";
import { createComment, deleteComment, fetchAnswerComments } from "../api/comments";

const commentsKey = (answerId: number) =>
  [...qk.qa.all, "answer", String(answerId), "comments"] as const;

export function useAnswerComments(answerId: number, enabled = true) {
  return useQuery({
    queryKey: commentsKey(answerId),
    queryFn: () => fetchAnswerComments(answerId),
    enabled,
  });
}

export function useAddComment(answerId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { body: string; parentCommentId?: number | null }) =>
      createComment({ answerId, userId: user!.id, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey(answerId) });
    },
  });
}

export function useDeleteComment(answerId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey(answerId) });
    },
  });
}
