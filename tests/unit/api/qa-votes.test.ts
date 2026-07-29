import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const {
  fetchQuestionVoteAggregates,
  fetchAnswerVoteAggregates,
  castQuestionVote,
  castAnswerVote,
} = await import("@/features/qa/api/votes");

beforeEach(() => {
  supabaseMock.from.mockReset();
});

describe("fetchQuestionVoteAggregates", () => {
  it("aggregates question_votes rows into scores and the user's own votes", async () => {
    supabaseMock.from.mockReturnValue(
      queryResult([
        { question_id: 1, user_id: "me", vote_value: 1 },
        { question_id: 1, user_id: "other", vote_value: 1 },
      ])
    );
    const result = await fetchQuestionVoteAggregates("me");
    expect(result.scores[1]).toBe(2);
    expect(result.userVotes[1]).toBe(1);
  });

  it("queries the question_votes table", async () => {
    supabaseMock.from.mockReturnValue(queryResult([]));
    await fetchQuestionVoteAggregates();
    expect(supabaseMock.from).toHaveBeenCalledWith("question_votes");
  });
});

describe("fetchAnswerVoteAggregates", () => {
  it("filters via the inner join on the question id", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchAnswerVoteAggregates(7, "me");
    expect(supabaseMock.from).toHaveBeenCalledWith("answer_votes");
    expect(builder.eq).toHaveBeenCalledWith("answers.question_id", 7);
  });

  it("aggregates by answer_id", async () => {
    supabaseMock.from.mockReturnValue(
      queryResult([{ answer_id: 3, user_id: "me", vote_value: -1 }])
    );
    const result = await fetchAnswerVoteAggregates(7, "me");
    expect(result.scores[3]).toBe(-1);
    expect(result.userVotes[3]).toBe(-1);
  });
});

describe("castQuestionVote", () => {
  it("deletes the vote when clicking the same direction again", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await castQuestionVote({ questionId: 1, userId: "u1", direction: 1, previous: 1 });
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("question_id", 1);
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(builder.upsert).not.toHaveBeenCalled();
  });

  it("upserts when there is no previous vote", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await castQuestionVote({ questionId: 1, userId: "u1", direction: 1 });
    expect(builder.upsert).toHaveBeenCalledWith(
      { question_id: 1, user_id: "u1", vote_value: 1 },
      { onConflict: "question_id,user_id" }
    );
  });

  it("upserts (switches) when the previous vote was the opposite direction", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await castQuestionVote({ questionId: 1, userId: "u1", direction: 1, previous: -1 });
    expect(builder.upsert).toHaveBeenCalledWith(
      { question_id: 1, user_id: "u1", vote_value: 1 },
      { onConflict: "question_id,user_id" }
    );
    expect(builder.delete).not.toHaveBeenCalled();
  });
});

describe("castAnswerVote", () => {
  it("deletes the vote when clicking the same direction again", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await castAnswerVote({ answerId: 2, userId: "u1", direction: -1, previous: -1 });
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("answer_id", 2);
  });

  it("upserts when switching direction", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await castAnswerVote({ answerId: 2, userId: "u1", direction: 1, previous: -1 });
    expect(builder.upsert).toHaveBeenCalledWith(
      { answer_id: 2, user_id: "u1", vote_value: 1 },
      { onConflict: "answer_id,user_id" }
    );
  });
});
