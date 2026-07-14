import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchFollowersList,
  fetchFollowingList,
  fetchFollowStats,
  fetchIsFollowing,
  fetchMyFollowingIds,
  followUser,
  unfollowUser,
  type FollowStats,
} from "../api/profile";

export function useFollowStats(userId?: string) {
  return useQuery({
    queryKey: qk.profile.followStats(userId ?? ""),
    queryFn: () => fetchFollowStats(userId!),
    enabled: !!userId,
  });
}

/**
 * Follow/unfollow the given profile with optimistic updates on both the
 * "is following" flag and the follower count.
 */
export function useFollowToggle(profileUserId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isFollowingKey = [...qk.profile.followStats(profileUserId), "is-following", user?.id ?? ""];

  const isFollowingQuery = useQuery({
    queryKey: isFollowingKey,
    queryFn: () => fetchIsFollowing(user!.id, profileUserId),
    enabled: !!user && user.id !== profileUserId,
  });

  const mutation = useMutation({
    mutationFn: (next: boolean) =>
      next ? followUser(user!.id, profileUserId) : unfollowUser(user!.id, profileUserId),
    onMutate: async (next: boolean) => {
      await queryClient.cancelQueries({ queryKey: qk.profile.followStats(profileUserId) });
      const previousFollowing = queryClient.getQueryData<boolean>(isFollowingKey);
      const previousStats = queryClient.getQueryData<FollowStats>(
        qk.profile.followStats(profileUserId)
      );
      queryClient.setQueryData(isFollowingKey, next);
      if (previousStats) {
        queryClient.setQueryData<FollowStats>(qk.profile.followStats(profileUserId), {
          ...previousStats,
          followers: Math.max(0, previousStats.followers + (next ? 1 : -1)),
        });
      }
      return { previousFollowing, previousStats };
    },
    onError: (_error, _next, context) => {
      if (context?.previousFollowing !== undefined) {
        queryClient.setQueryData(isFollowingKey, context.previousFollowing);
      }
      if (context?.previousStats) {
        queryClient.setQueryData(qk.profile.followStats(profileUserId), context.previousStats);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.profile.followStats(profileUserId) });
    },
  });

  return {
    isFollowing: isFollowingQuery.data ?? false,
    isLoading: isFollowingQuery.isLoading,
    isPending: mutation.isPending,
    toggle: () => {
      if (!user) return;
      mutation.mutate(!(isFollowingQuery.data ?? false));
    },
  };
}

export function useFollowersList(userId?: string) {
  return useQuery({
    queryKey: [...qk.profile.detail(userId ?? ""), "followers-list"],
    queryFn: () => fetchFollowersList(userId!),
    enabled: !!userId,
  });
}

export function useFollowingList(userId?: string) {
  return useQuery({
    queryKey: [...qk.profile.detail(userId ?? ""), "following-list"],
    queryFn: () => fetchFollowingList(userId!),
    enabled: !!userId,
  });
}

/** Ids of the users the signed-in viewer follows. */
export function useMyFollowingIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...qk.profile.detail(user?.id ?? ""), "following-ids"],
    queryFn: () => fetchMyFollowingIds(user!.id),
    enabled: !!user,
  });
}

/** Follow/unfollow an arbitrary user from a list (followers/following pages). */
export function useToggleFollowUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetId, follow }: { targetId: string; follow: boolean }) =>
      follow ? followUser(user!.id, targetId) : unfollowUser(user!.id, targetId),
    onSuccess: (_data, { targetId }) => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: qk.profile.detail(user.id) });
        queryClient.invalidateQueries({ queryKey: qk.profile.followStats(user.id) });
      }
      queryClient.invalidateQueries({ queryKey: qk.profile.followStats(targetId) });
    },
  });
}
