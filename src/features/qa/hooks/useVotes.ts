import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { qk } from "@/shared/lib/queryKeys";
import {
  castAnswerVote,
  castQuestionVote,
  fetchAnswerVoteAggregates,
  fetchQuestionVoteAggregates,
  type VoteAggregates,
  type VoteValue,
} from "../api/votes";

const EMPTY_SCORES: Record<number, number> = {};
const EMPTY_USER_VOTES: Record<number, VoteValue> = {};

const questionVotesKey = (userId?: string) =>
  [...qk.qa.voteCounts, "questions", userId ?? "anon"] as const;

const answerVotesKey = (questionId: number, userId?: string) =>
  [...qk.qa.voteCounts, "answers", String(questionId), userId ?? "anon"] as const;

/** Optimistic cache update with correct delta math:
 *  up -> remove = -1, up -> down = -2, none -> up = +1 (and mirrored). */
export function applyVoteDelta(
  current: VoteAggregates | undefined,
  targetId: number,
  direction: VoteValue
): VoteAggregates {
  const scores = { ...(current?.scores ?? {}) };
  const userVotes = { ...(current?.userVotes ?? {}) };
  const previous = userVotes[targetId];

  if (previous === direction) {
    scores[targetId] = (scores[targetId] ?? 0) - direction;
    delete userVotes[targetId];
  } else if (previous !== undefined) {
    scores[targetId] = (scores[targetId] ?? 0) + 2 * direction;
    userVotes[targetId] = direction;
  } else {
    scores[targetId] = (scores[targetId] ?? 0) + direction;
    userVotes[targetId] = direction;
  }
  return { scores, userVotes };
}

/** All question vote aggregates + the current user's votes in one query. */
export function useQuestionVotes() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: questionVotesKey(user?.id),
    queryFn: () => fetchQuestionVoteAggregates(user?.id),
  });
  return {
    scores: query.data?.scores ?? EMPTY_SCORES,
    userVotes: query.data?.userVotes ?? EMPTY_USER_VOTES,
    isLoading: query.isLoading,
  };
}

/** Vote aggregates for the answers of one question. */
export function useAnswerVotes(questionId: number | null) {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: answerVotesKey(questionId ?? -1, user?.id),
    queryFn: () => fetchAnswerVoteAggregates(questionId!, user?.id),
    enabled: questionId != null,
  });
  return {
    scores: query.data?.scores ?? EMPTY_SCORES,
    userVotes: query.data?.userVotes ?? EMPTY_USER_VOTES,
    isLoading: query.isLoading,
  };
}

function requireUser(user: { id: string } | null | undefined): user is { id: string } {
  if (!user) {
    toast({
      title: "Sign in required",
      description: "Please sign in to vote.",
      variant: "destructive",
    });
    return false;
  }
  return true;
}

/** Optimistic question voting with toggle/switch semantics. */
export function useQuestionVote() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (vars: { questionId: number; direction: VoteValue; previous?: VoteValue }) =>
      castQuestionVote({ ...vars, userId: user!.id }),
    onMutate: async ({ questionId, direction }) => {
      const key = questionVotesKey(user?.id);
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueryData<VoteAggregates>(key);
      queryClient.setQueryData<VoteAggregates>(key, (current) =>
        applyVoteDelta(current, questionId, direction)
      );
      return { key, snapshot };
    },
    onError: (_error, _vars, context) => {
      if (context) queryClient.setQueryData(context.key, context.snapshot);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [...qk.qa.voteCounts, "questions"] });
    },
  });

  const vote = (questionId: number, direction: VoteValue) => {
    if (!requireUser(user)) return;
    const current = queryClient.getQueryData<VoteAggregates>(questionVotesKey(user.id));
    mutation.mutate({ questionId, direction, previous: current?.userVotes[questionId] });
  };

  return { vote, isPending: mutation.isPending };
}

/** Optimistic answer voting with toggle/switch semantics. */
export function useAnswerVote(questionId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (vars: { answerId: number; direction: VoteValue; previous?: VoteValue }) =>
      castAnswerVote({ ...vars, userId: user!.id }),
    onMutate: async ({ answerId, direction }) => {
      const key = answerVotesKey(questionId, user?.id);
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueryData<VoteAggregates>(key);
      queryClient.setQueryData<VoteAggregates>(key, (current) =>
        applyVoteDelta(current, answerId, direction)
      );
      return { key, snapshot };
    },
    onError: (_error, _vars, context) => {
      if (context) queryClient.setQueryData(context.key, context.snapshot);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [...qk.qa.voteCounts, "answers", String(questionId)],
      });
    },
  });

  const vote = (answerId: number, direction: VoteValue) => {
    if (!requireUser(user)) return;
    const current = queryClient.getQueryData<VoteAggregates>(answerVotesKey(questionId, user.id));
    mutation.mutate({ answerId, direction, previous: current?.userVotes[answerId] });
  };

  return { vote, isPending: mutation.isPending };
}
