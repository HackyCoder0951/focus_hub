import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "../../test-utils";
import { qk } from "@/shared/lib/queryKeys";

let currentUser: { id: string } | null = { id: "me" };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: currentUser }),
}));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ toast: toastMock }));

const { castQuestionVote } = vi.hoisted(() => ({ castQuestionVote: vi.fn() }));
vi.mock("@/features/qa/api/votes", () => ({
  fetchQuestionVoteAggregates: vi.fn(),
  fetchAnswerVoteAggregates: vi.fn(),
  castQuestionVote,
  castAnswerVote: vi.fn(),
}));

const { useQuestionVote } = await import("@/features/qa/hooks/useVotes");

const questionVotesKey = ["qa", "vote-counts", "questions", "me"] as const;

function wrapper(queryClient: ReturnType<typeof createTestQueryClient>) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  currentUser = { id: "me" };
  castQuestionVote.mockReset();
  toastMock.mockReset();
});

describe("useQuestionVote", () => {
  it("optimistically applies an upvote to the cached aggregates", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    queryClient.setQueryData(questionVotesKey, { scores: { 1: 0 }, userVotes: {} });

    let resolveVote!: () => void;
    castQuestionVote.mockImplementation(() => new Promise<void>((resolve) => { resolveVote = resolve; }));

    const { result } = renderHook(() => useQuestionVote(), { wrapper: wrapper(queryClient) });
    act(() => {
      result.current.vote(1, 1);
    });

    await waitFor(() => {
      const cache = queryClient.getQueryData<{ scores: Record<number, number> }>(questionVotesKey);
      expect(cache!.scores[1]).toBe(1);
    });

    resolveVote();
    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it("passes the previous vote direction through so the API can toggle/switch", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    queryClient.setQueryData(questionVotesKey, { scores: { 1: 1 }, userVotes: { 1: 1 } });
    castQuestionVote.mockResolvedValue(undefined);

    const { result } = renderHook(() => useQuestionVote(), { wrapper: wrapper(queryClient) });
    act(() => {
      result.current.vote(1, 1); // clicking upvote again -> retract
    });

    await waitFor(() => {
      expect(castQuestionVote).toHaveBeenCalledWith(
        expect.objectContaining({ questionId: 1, direction: 1, previous: 1, userId: "me" })
      );
    });
  });

  it("rolls back the cache when the vote request fails", async () => {
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    queryClient.setQueryData(questionVotesKey, { scores: { 1: 0 }, userVotes: {} });
    castQuestionVote.mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useQuestionVote(), { wrapper: wrapper(queryClient) });
    act(() => {
      result.current.vote(1, 1);
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
    const cache = queryClient.getQueryData<{ scores: Record<number, number> }>(questionVotesKey);
    expect(cache!.scores[1]).toBe(0);
  });

  it("shows a sign-in toast and does not call the API when there is no user", async () => {
    currentUser = null;
    const queryClient = createTestQueryClient({ gcTime: Infinity });
    const { result } = renderHook(() => useQuestionVote(), { wrapper: wrapper(queryClient) });

    act(() => {
      result.current.vote(1, 1);
    });

    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Sign in required" })
    );
    expect(castQuestionVote).not.toHaveBeenCalled();
  });
});
