import { describe, it, expect } from "vitest";
import { applyVoteDelta } from "@/features/qa/hooks/useVotes";

describe("applyVoteDelta", () => {
  it("adds a fresh upvote when there is no current state", () => {
    const result = applyVoteDelta(undefined, 1, 1);
    expect(result.scores[1]).toBe(1);
    expect(result.userVotes[1]).toBe(1);
  });

  it("adds a fresh downvote when there is no current state", () => {
    const result = applyVoteDelta(undefined, 1, -1);
    expect(result.scores[1]).toBe(-1);
    expect(result.userVotes[1]).toBe(-1);
  });

  it("retracts the vote when clicking the same direction again", () => {
    const first = applyVoteDelta(undefined, 1, 1);
    const second = applyVoteDelta(first, 1, 1);
    expect(second.scores[1]).toBe(0);
    expect(second.userVotes[1]).toBeUndefined();
  });

  it("flips from downvote to upvote with a +2 swing", () => {
    const first = applyVoteDelta(undefined, 1, -1);
    const second = applyVoteDelta(first, 1, 1);
    expect(second.scores[1]).toBe(1);
    expect(second.userVotes[1]).toBe(1);
  });

  it("flips from upvote to downvote with a -2 swing", () => {
    const first = applyVoteDelta(undefined, 1, 1);
    const second = applyVoteDelta(first, 1, -1);
    expect(second.scores[1]).toBe(-1);
    expect(second.userVotes[1]).toBe(-1);
  });

  it("does not mutate scores/votes for other targets", () => {
    const first = applyVoteDelta(undefined, 1, 1);
    const second = applyVoteDelta(first, 2, 1);
    expect(second.scores).toEqual({ 1: 1, 2: 1 });
    expect(second.userVotes).toEqual({ 1: 1, 2: 1 });
  });
});
