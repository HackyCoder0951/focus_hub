import { describe, it, expect } from "vitest";
import { aggregate } from "@/features/qa/api/votes";

describe("aggregate", () => {
  it("sums vote values per target", () => {
    const result = aggregate([
      { target_id: 1, user_id: "a", vote_value: 1 },
      { target_id: 1, user_id: "b", vote_value: 1 },
      { target_id: 1, user_id: "c", vote_value: -1 },
    ]);
    expect(result.scores[1]).toBe(1);
  });

  it("tracks separate scores per target", () => {
    const result = aggregate([
      { target_id: 1, user_id: "a", vote_value: 1 },
      { target_id: 2, user_id: "a", vote_value: -1 },
    ]);
    expect(result.scores).toEqual({ 1: 1, 2: -1 });
  });

  it("records the given user's own vote when userId matches", () => {
    const result = aggregate(
      [
        { target_id: 1, user_id: "me", vote_value: 1 },
        { target_id: 1, user_id: "someone-else", vote_value: -1 },
      ],
      "me"
    );
    expect(result.userVotes).toEqual({ 1: 1 });
  });

  it("returns an empty userVotes map when no userId is given", () => {
    const result = aggregate([{ target_id: 1, user_id: "me", vote_value: 1 }]);
    expect(result.userVotes).toEqual({});
  });

  it("ignores vote_value outside 1/-1 for userVotes but still sums scores", () => {
    const result = aggregate([{ target_id: 1, user_id: "me", vote_value: 5 }], "me");
    expect(result.scores[1]).toBe(5);
    expect(result.userVotes).toEqual({});
  });

  it("returns empty aggregates for no rows", () => {
    expect(aggregate([])).toEqual({ scores: {}, userVotes: {} });
  });
});
