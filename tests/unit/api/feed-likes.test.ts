import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { fetchIsLiked, toggleLike } = await import("@/features/feed/api/likes");

beforeEach(() => {
  supabaseMock.from.mockReset();
});

describe("fetchIsLiked", () => {
  it("returns true when at least one row is found", async () => {
    supabaseMock.from.mockReturnValue(queryResult([{ id: "l1" }]));
    expect(await fetchIsLiked("p1", "u1")).toBe(true);
  });

  it("returns false when no rows are found", async () => {
    supabaseMock.from.mockReturnValue(queryResult([]));
    expect(await fetchIsLiked("p1", "u1")).toBe(false);
  });

  it("returns false when data is null", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null));
    expect(await fetchIsLiked("p1", "u1")).toBe(false);
  });

  it("filters by both post and user, limited to 1 row", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchIsLiked("p1", "u1");
    expect(builder.eq).toHaveBeenCalledWith("post_id", "p1");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(builder.limit).toHaveBeenCalledWith(1);
  });
});

describe("toggleLike", () => {
  it("deletes the like row when currently liked", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await toggleLike("p1", "u1", true);
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("post_id", "p1");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u1");
  });

  it("inserts a like row when not currently liked", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await toggleLike("p1", "u1", false);
    expect(builder.insert).toHaveBeenCalledWith({ post_id: "p1", user_id: "u1" });
  });
});
