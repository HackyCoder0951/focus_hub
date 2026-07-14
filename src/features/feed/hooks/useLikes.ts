import {
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import { fetchIsLiked, toggleLike } from "../api/likes";
import type { FeedPost } from "../api/posts";

const likedKey = (postId: string, userId?: string) =>
  [...qk.posts.all, postId, "liked", userId ?? "anon"] as const;

/** Whether the current user has liked the post. */
export function usePostLiked(postId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: likedKey(postId, user?.id),
    queryFn: () => fetchIsLiked(postId, user!.id),
    enabled: Boolean(user),
  });
}

type FeedInfiniteData = InfiniteData<FeedPost[]>;

/**
 * Optimistic like toggle: flips the liked flag and adjusts the count in
 * every cached feed page immediately, rolling back if the request fails.
 * Server truth is restored by the realtime invalidation.
 */
export function useToggleLike(postId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ liked }: { liked: boolean }) => toggleLike(postId, user!.id, liked),
    onMutate: async ({ liked }) => {
      const key = likedKey(postId, user?.id);
      await queryClient.cancelQueries({ queryKey: qk.posts.all });

      const prevLiked = queryClient.getQueryData<boolean>(key);
      const prevLists = queryClient.getQueriesData<FeedInfiniteData>({
        queryKey: qk.posts.all,
      });

      queryClient.setQueryData(key, !liked);
      queryClient.setQueriesData<FeedInfiniteData>(
        { queryKey: qk.posts.all },
        (old) => {
          // Only touch infinite feed caches (they have a `pages` array).
          if (!old || !Array.isArray(old.pages)) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              Array.isArray(page)
                ? page.map((post) =>
                    post.id === postId
                      ? {
                          ...post,
                          likes_count: Math.max(
                            0,
                            (post.likes_count ?? 0) + (liked ? -1 : 1)
                          ),
                        }
                      : post
                  )
                : page
            ),
          };
        }
      );

      return { key, prevLiked, prevLists };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(context.key, context.prevLiked);
      for (const [cacheKey, data] of context.prevLists) {
        queryClient.setQueryData(cacheKey, data);
      }
    },
  });
}
