import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../../test-utils";
import { qk } from "@/shared/lib/queryKeys";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "me" } }),
}));

const { toggleCommentLike } = vi.hoisted(() => ({ toggleCommentLike: vi.fn() }));
vi.mock("@/features/feed/api/comments", () => ({
  fetchComments: vi.fn(),
  fetchMyLikedCommentIds: vi.fn(),
  toggleCommentLike,
}));

const { useToggleCommentLike } = await import("@/features/feed/hooks/useComments");

function wrapper(queryClient: ReturnType<typeof createTestQueryClient>) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  toggleCommentLike.mockReset();
});

describe("useToggleCommentLike", () => {
  it("optimistically increments the comment's like count and adds it to the liked-ids set", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    const commentsKey = qk.posts.comments("p1");
    const likedKey = [...commentsKey, "liked", "me"];
    queryClient.setQueryData(commentsKey, [{ id: "c1", comment_likes: [{ count: 2 }] }]);
    queryClient.setQueryData(likedKey, [] as string[]);

    let resolveToggle!: () => void;
    toggleCommentLike.mockImplementation(
      () => new Promise<void>((resolve) => { resolveToggle = resolve; })
    );

    const { result } = renderHook(() => useToggleCommentLike("p1"), { wrapper: wrapper(queryClient) });
    act(() => {
      result.current.mutate({ commentId: "c1", liked: false });
    });

    await waitFor(() => {
      const comments = queryClient.getQueryData<{ id: string; comment_likes: { count: number }[] }[]>(commentsKey);
      expect(comments![0].comment_likes[0].count).toBe(3);
      expect(queryClient.getQueryData<string[]>(likedKey)).toEqual(["c1"]);
    });

    resolveToggle();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("removes the comment id from the liked set and decrements the count when unliking", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    const commentsKey = qk.posts.comments("p1");
    const likedKey = [...commentsKey, "liked", "me"];
    queryClient.setQueryData(commentsKey, [{ id: "c1", comment_likes: [{ count: 3 }] }]);
    queryClient.setQueryData(likedKey, ["c1"]);
    toggleCommentLike.mockResolvedValue(undefined);

    const { result } = renderHook(() => useToggleCommentLike("p1"), { wrapper: wrapper(queryClient) });
    act(() => {
      result.current.mutate({ commentId: "c1", liked: true });
    });

    await waitFor(() => {
      const comments = queryClient.getQueryData<{ id: string; comment_likes: { count: number }[] }[]>(commentsKey);
      expect(comments![0].comment_likes[0].count).toBe(2);
      expect(queryClient.getQueryData<string[]>(likedKey)).toEqual([]);
    });
  });

  it("rolls back both caches when the mutation fails", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    const commentsKey = qk.posts.comments("p1");
    const likedKey = [...commentsKey, "liked", "me"];
    queryClient.setQueryData(commentsKey, [{ id: "c1", comment_likes: [{ count: 2 }] }]);
    queryClient.setQueryData(likedKey, [] as string[]);
    toggleCommentLike.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useToggleCommentLike("p1"), { wrapper: wrapper(queryClient) });
    act(() => {
      result.current.mutate({ commentId: "c1", liked: false });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    const comments = queryClient.getQueryData<{ id: string; comment_likes: { count: number }[] }[]>(commentsKey);
    expect(comments![0].comment_likes[0].count).toBe(2);
    expect(queryClient.getQueryData<string[]>(likedKey)).toEqual([]);
  });
});
