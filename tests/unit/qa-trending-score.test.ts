import { describe, it, expect } from "vitest";
import { trendingScore } from "@/features/qa/hooks/useQuestions";
import type { QaQuestion } from "@/features/qa/api/questions";

function makeQuestion(overrides: Partial<QaQuestion>): QaQuestion {
  return {
    created_at: new Date().toISOString(),
    answer_count: 0,
    ...overrides,
  } as QaQuestion;
}

describe("trendingScore", () => {
  it("weights vote score by 2x", () => {
    const q = makeQuestion({ created_at: new Date(0).toISOString(), answer_count: 0 });
    expect(trendingScore(q, 5)).toBeCloseTo(10, 5);
  });

  it("weights answer count by 3x", () => {
    const q = makeQuestion({ created_at: new Date(0).toISOString(), answer_count: 4 });
    expect(trendingScore(q, 0)).toBeCloseTo(12, 5);
  });

  it("gives a fresh (just-created) question the full +10 recency boost", () => {
    const q = makeQuestion({ created_at: new Date().toISOString(), answer_count: 0 });
    expect(trendingScore(q, 0)).toBeCloseTo(10, 0);
  });

  it("gives an old question (>=10 days) no recency boost", () => {
    const elevenDaysAgo = new Date(Date.now() - 11 * 86_400_000).toISOString();
    const q = makeQuestion({ created_at: elevenDaysAgo, answer_count: 0 });
    expect(trendingScore(q, 0)).toBe(0);
  });

  it("never lets recency boost go negative for very old questions", () => {
    const yearAgo = new Date(Date.now() - 365 * 86_400_000).toISOString();
    const q = makeQuestion({ created_at: yearAgo, answer_count: 0 });
    expect(trendingScore(q, 0)).toBe(0);
  });

  it("combines vote score, answer count, and recency", () => {
    const q = makeQuestion({ created_at: new Date().toISOString(), answer_count: 2 });
    const score = trendingScore(q, 3);
    // 3*2 + 2*3 + ~10 recency boost
    expect(score).toBeGreaterThanOrEqual(6 + 6);
    expect(score).toBeLessThanOrEqual(6 + 6 + 10);
  });
});
