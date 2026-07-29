import { describe, it, expect, vi, beforeEach } from "vitest";
import { countResult, queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { fetchAdminStats, fetchAdminAnalytics } = await import("@/features/admin/api/stats");

beforeEach(() => {
  supabaseMock.from.mockReset();
});

describe("fetchAdminStats", () => {
  it("computes total/currentMonth/previousMonth/change for each counted table", async () => {
    // Order matches Promise.all in fetchAdminStats: userTotal, postTotal,
    // msgTotal, fileTotal, userCurr, userPrev, postCurr, postPrev,
    // msgCurr, msgPrev, fileCurr, filePrev.
    const counts = [100, 50, 200, 10, 20, 10, 5, 10, 30, 20, 2, 2];
    counts.forEach((c) => supabaseMock.from.mockReturnValueOnce(countResult(c)));

    const stats = await fetchAdminStats();

    expect(stats.users).toEqual({ total: 100, currentMonth: 20, previousMonth: 10, change: 100 });
    expect(stats.posts).toEqual({ total: 50, currentMonth: 5, previousMonth: 10, change: -50 });
    expect(stats.messages).toEqual({ total: 200, currentMonth: 30, previousMonth: 20, change: 50 });
    expect(stats.files).toEqual({ total: 10, currentMonth: 2, previousMonth: 2, change: 0 });
  });

  it("treats a null count as 0", async () => {
    Array.from({ length: 12 }).forEach(() =>
      supabaseMock.from.mockReturnValueOnce(countResult(null as unknown as number))
    );
    const stats = await fetchAdminStats();
    expect(stats.users).toEqual({ total: 0, currentMonth: 0, previousMonth: 0, change: 0 });
  });
});

describe("fetchAdminAnalytics", () => {
  it("buckets a row created this month into the most recent bucket", async () => {
    const now = new Date();
    const thisMonthIso = new Date(now.getFullYear(), now.getMonth(), 15).toISOString();

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "profiles") return queryResult([{ created_at: thisMonthIso }]);
      if (table === "posts") return queryResult([{ created_at: thisMonthIso }]);
      if (table === "filemodels") return queryResult([]);
      return queryResult([]);
    });

    const buckets = await fetchAdminAnalytics();
    expect(buckets).toHaveLength(6);
    const lastBucket = buckets[buckets.length - 1];
    expect(lastBucket.users).toBe(1);
    expect(lastBucket.posts).toBe(1);
    expect(lastBucket.files).toBe(0);
  });

  it("ignores rows that fall outside the 6-month window's bucket keys", async () => {
    const farPast = new Date(2000, 0, 1).toISOString();
    supabaseMock.from.mockReturnValue(queryResult([{ created_at: farPast }]));
    const buckets = await fetchAdminAnalytics();
    const total = buckets.reduce((sum, b) => sum + b.users, 0);
    expect(total).toBe(0);
  });
});
