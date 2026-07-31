import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../../test-utils";
import { qk } from "@/shared/lib/queryKeys";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "me" } }),
}));

const { toggleLike } = vi.hoisted(() => ({ toggleLike: vi.fn() }));
vi.mock("@/features/feed/api/likes", () => ({
  fetchIsLiked: vi.fn(),
  toggleLike,
}));

const { useToggleLike } = await import("@/features/feed/hooks/useLikes");

function seedFeedCache(queryClient: ReturnType<typeof createTestQueryClient>, postId: string, likesCount: number) {
  queryClient.setQueryData(qk.posts.all, {
    pages: [[{ id: postId, likes_count: likesCount }]],
    pageParams: [undefined],
  });
}

function wrapper(queryClient: ReturnType<typeof createTestQueryClient>) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  toggleLike.mockReset();
});

describe("useToggleLike", () => {
  it("optimistically increments the cached like count when liking", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    seedFeedCache(queryClient, "p1", 2);

    let resolveToggle!: () => void;
    toggleLike.mockImplementation(() => new Promise<void>((resolve) => { resolveToggle = resolve; }));

    const { result } = renderHook(() => useToggleLike("p1"), { wrapper: wrapper(queryClient) });

    act(() => {
      result.current.mutate({ liked: false });
    });

    await waitFor(() => {
      const cache = queryClient.getQueryData<{ pages: { id: string; likes_count: number }[][] }>(qk.posts.all);
      expect(cache!.pages[0][0].likes_count).toBe(3);
    });

    resolveToggle();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("optimistically decrements the cached like count when unliking", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    seedFeedCache(queryClient, "p1", 3);
    toggleLike.mockResolvedValue(undefined);

    const { result } = renderHook(() => useToggleLike("p1"), { wrapper: wrapper(queryClient) });
    act(() => {
      result.current.mutate({ liked: true });
    });

    await waitFor(() => {
      const cache = queryClient.getQueryData<{ pages: { id: string; likes_count: number }[][] }>(qk.posts.all);
      expect(cache!.pages[0][0].likes_count).toBe(2);
    });
  });

  it("never lets the optimistic count go below 0", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    seedFeedCache(queryClient, "p1", 0);
    toggleLike.mockResolvedValue(undefined);

    const { result } = renderHook(() => useToggleLike("p1"), { wrapper: wrapper(queryClient) });
    act(() => {
      result.current.mutate({ liked: true });
    });

    await waitFor(() => {
      const cache = queryClient.getQueryData<{ pages: { id: string; likes_count: number }[][] }>(qk.posts.all);
      expect(cache!.pages[0][0].likes_count).toBe(0);
    });
  });

  it("rolls back the optimistic update when the mutation fails", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    seedFeedCache(queryClient, "p1", 2);
    toggleLike.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useToggleLike("p1"), { wrapper: wrapper(queryClient) });
    act(() => {
      result.current.mutate({ liked: false });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    const cache = queryClient.getQueryData<{ pages: { id: string; likes_count: number }[][] }>(qk.posts.all);
    expect(cache!.pages[0][0].likes_count).toBe(2);
  });
});
