import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { fetchRecentActivity } = await import("@/features/admin/api/activity");

beforeEach(() => {
  supabaseMock.from.mockReset();
});

describe("fetchRecentActivity", () => {
  it("merges posts/questions/files/signups into one feed, newest first", async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "posts") return queryResult([{ id: 1, content: "hi", created_at: "2026-01-01T00:00:00Z" }]);
      if (table === "questions") return queryResult([{ id: 2, title: "q?", created_at: "2026-03-01T00:00:00Z" }]);
      if (table === "filemodels") return queryResult([{ id: 3, file_name: "a.txt", created_at: "2026-02-01T00:00:00Z" }]);
      if (table === "profiles") return queryResult([{ id: "u1", full_name: "New User", email: "u@x.com", created_at: "2026-04-01T00:00:00Z" }]);
      return queryResult([]);
    });

    const result = await fetchRecentActivity();
    expect(result.map((r) => r.key)).toEqual(["user-u1", "question-2", "file-3", "post-1"]);
  });

  it("falls back to email for a signup with no full_name", async () => {
    supabaseMock.from.mockImplementation((table: string) =>
      table === "profiles"
        ? queryResult([{ id: "u1", full_name: null, email: "u@x.com", created_at: "2026-01-01T00:00:00Z" }])
        : queryResult([])
    );
    const [item] = await fetchRecentActivity();
    expect(item.description).toBe("New member: u@x.com");
  });

  it("caps results at 10 items", async () => {
    const many = (table: string) =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        content: `x${i}`,
        title: `x${i}`,
        file_name: `x${i}`,
        full_name: `x${i}`,
        email: `x${i}@x.com`,
        created_at: new Date(2026, 0, i + 1).toISOString(),
      }));
    supabaseMock.from.mockImplementation((table: string) => queryResult(many(table)));
    const result = await fetchRecentActivity();
    expect(result.length).toBeLessThanOrEqual(10);
  });
});
