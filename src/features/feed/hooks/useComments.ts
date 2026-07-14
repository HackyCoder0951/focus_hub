import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import {
  addComment,
  deleteComment,
  fetchComments,
  fetchMyLikedCommentIds,
  toggleCommentLike,
  updateComment,
  type CommentWithAuthor,
} from "../api/comments";

const myCommentLikesKey = (postId: string, userId?: string) =>
  [...qk.posts.comments(postId), "liked", userId ?? "anon"] as const;

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: qk.posts.comments(postId),
    queryFn: () => fetchComments(postId),
  });
}

/** IDs of the post's comments the current user has liked. */
export function useMyLikedCommentIds(postId: string, commentIds: string[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: myCommentLikesKey(postId, user?.id),
    queryFn: () => fetchMyLikedCommentIds(commentIds, user!.id),
    enabled: Boolean(user) && commentIds.length > 0,
  });
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (input: { content: string; parentId?: string | null }) =>
      addComment({
        postId,
        userId: user!.id,
        content: input.content,
        parentId: input.parentId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.posts.comments(postId) });
    },
  });
}

export function useUpdateComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      updateComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.posts.comments(postId) });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.posts.comments(postId) });
    },
  });
}

/**
 * Optimistic comment-like toggle: updates the liked-ids set and the
 * aggregated count in the comments cache, rolling back on error.
 */
export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ commentId, liked }: { commentId: string; liked: boolean }) =>
      toggleCommentLike(commentId, user!.id, liked),
    onMutate: async ({ commentId, liked }) => {
      const likedKey = myCommentLikesKey(postId, user?.id);
      const commentsKey = qk.posts.comments(postId);
      await queryClient.cancelQueries({ queryKey: commentsKey });

      const prevLikedIds = queryClient.getQueryData<string[]>(likedKey);
      const prevComments =
        queryClient.getQueryData<CommentWithAuthor[]>(commentsKey);

      queryClient.setQueryData<string[]>(likedKey, (old = []) =>
        liked ? old.filter((id) => id !== commentId) : [...old, commentId]
      );
      queryClient.setQueryData<CommentWithAuthor[]>(commentsKey, (old) =>
        old?.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                comment_likes: [
                  {
                    count: Math.max(
                      0,
                      (comment.comment_likes?.[0]?.count ?? 0) + (liked ? -1 : 1)
                    ),
                  },
                ],
              }
            : comment
        )
      );

      return { likedKey, commentsKey, prevLikedIds, prevComments };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(context.likedKey, context.prevLikedIds);
      queryClient.setQueryData(context.commentsKey, context.prevComments);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.posts.comments(postId) });
    },
  });
}
