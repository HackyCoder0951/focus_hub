import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../../test-utils";
import { qk } from "@/shared/lib/queryKeys";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "me" } }),
}));

const { followUser, unfollowUser, fetchIsFollowing } = vi.hoisted(() => ({
  followUser: vi.fn(),
  unfollowUser: vi.fn(),
  fetchIsFollowing: vi.fn(),
}));
vi.mock("@/features/profile/api/profile", () => ({
  fetchFollowersList: vi.fn(),
  fetchFollowingList: vi.fn(),
  fetchFollowStats: vi.fn(),
  fetchIsFollowing,
  fetchMyFollowingIds: vi.fn(),
  followUser,
  unfollowUser,
}));

const { useFollowToggle } = await import("@/features/profile/hooks/useFollow");

function wrapper(queryClient: ReturnType<typeof createTestQueryClient>) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  followUser.mockReset();
  unfollowUser.mockReset();
  fetchIsFollowing.mockReset().mockResolvedValue(false);
});

describe("useFollowToggle", () => {
  it("optimistically flips isFollowing and increments the follower count", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    queryClient.setQueryData(qk.profile.followStats("target"), { followers: 5, following: 2 });

    let resolveFollow!: () => void;
    followUser.mockImplementation(() => new Promise<void>((resolve) => { resolveFollow = resolve; }));

    const { result } = renderHook(() => useFollowToggle("target"), { wrapper: wrapper(queryClient) });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.toggle();
    });

    await waitFor(() => {
      expect(result.current.isFollowing).toBe(true);
      const stats = queryClient.getQueryData<{ followers: number }>(qk.profile.followStats("target"));
      expect(stats!.followers).toBe(6);
    });

    resolveFollow();
    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(followUser).toHaveBeenCalledWith("me", "target");
  });

  it("calls unfollowUser and decrements the count when already following", async () => {
    fetchIsFollowing.mockResolvedValue(true);
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    queryClient.setQueryData(qk.profile.followStats("target"), { followers: 5, following: 2 });
    unfollowUser.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFollowToggle("target"), { wrapper: wrapper(queryClient) });
    await waitFor(() => expect(result.current.isFollowing).toBe(true));

    act(() => {
      result.current.toggle();
    });

    await waitFor(() => {
      const stats = queryClient.getQueryData<{ followers: number }>(qk.profile.followStats("target"));
      expect(stats!.followers).toBe(4);
    });
    expect(unfollowUser).toHaveBeenCalledWith("me", "target");
  });

  it("rolls back isFollowing and the follower count on failure", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    queryClient.setQueryData(qk.profile.followStats("target"), { followers: 5, following: 2 });
    followUser.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useFollowToggle("target"), { wrapper: wrapper(queryClient) });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.toggle();
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    expect(result.current.isFollowing).toBe(false);
    const stats = queryClient.getQueryData<{ followers: number }>(qk.profile.followStats("target"));
    expect(stats!.followers).toBe(5);
  });

  it("never lets the follower count go below 0", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    fetchIsFollowing.mockResolvedValue(true);
    queryClient.setQueryData(qk.profile.followStats("target"), { followers: 0, following: 0 });
    unfollowUser.mockResolvedValue(undefined);

    const { result } = renderHook(() => useFollowToggle("target"), { wrapper: wrapper(queryClient) });
    await waitFor(() => expect(result.current.isFollowing).toBe(true));

    act(() => {
      result.current.toggle();
    });

    await waitFor(() => {
      const stats = queryClient.getQueryData<{ followers: number }>(qk.profile.followStats("target"));
      expect(stats!.followers).toBe(0);
    });
  });
});
