import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { fetchFlags, resolveFlag } = await import("@/features/admin/api/flags");

beforeEach(() => {
  supabaseMock.from.mockReset();
});

describe("fetchFlags", () => {
  it("returns [] immediately when there are no flags (no post/profile queries fired)", async () => {
    supabaseMock.from.mockReturnValue(queryResult([]));
    const result = await fetchFlags("all");
    expect(result).toEqual([]);
    expect(supabaseMock.from).toHaveBeenCalledTimes(1);
  });

  it("applies the pending-status OR filter", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchFlags("pending");
    expect(builder.or).toHaveBeenCalledWith("status.eq.pending,status.is.null");
  });

  it("applies the history in-filter for resolved+dismissed", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchFlags("history");
    expect(builder.in).toHaveBeenCalledWith("status", ["resolved", "dismissed"]);
  });

  it("applies an exact status filter for a specific status", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchFlags("resolved");
    expect(builder.eq).toHaveBeenCalledWith("status", "resolved");
  });

  it("does not filter by status for 'all'", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchFlags("all");
    expect(builder.eq).not.toHaveBeenCalled();
    expect(builder.or).not.toHaveBeenCalled();
    expect(builder.in).not.toHaveBeenCalled();
  });

  it("joins flags with their post and both reporter/author profiles", async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "content_flags") {
        return queryResult([
          { id: "f1", post_id: "p1", flagged_by_user_id: "reporter1" },
        ]);
      }
      if (table === "posts") {
        return queryResult([{ id: "p1", content: "bad post", user_id: "author1", is_deleted: false }]);
      }
      if (table === "profiles") {
        return queryResult([
          { id: "reporter1", full_name: "Reporter", email: "r@x.com" },
          { id: "author1", full_name: "Author", email: "a@x.com" },
        ]);
      }
      return queryResult([]);
    });

    const [result] = await fetchFlags("all");
    expect(result.post?.id).toBe("p1");
    expect(result.reporter?.full_name).toBe("Reporter");
    expect(result.author?.full_name).toBe("Author");
  });

  it("handles a flag whose post was already deleted (post_id present but post missing)", async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "content_flags") {
        return queryResult([{ id: "f1", post_id: "p1", flagged_by_user_id: "reporter1" }]);
      }
      if (table === "posts") return queryResult([]);
      if (table === "profiles") return queryResult([{ id: "reporter1", full_name: "R", email: "r@x.com" }]);
      return queryResult([]);
    });

    const [result] = await fetchFlags("all");
    expect(result.post).toBeNull();
    expect(result.author).toBeNull();
    expect(result.reporter?.full_name).toBe("R");
  });
});

describe("resolveFlag", () => {
  it("marks the post deleted and the flag resolved on 'remove'", async () => {
    const postsBuilder = queryResult(null);
    const flagsBuilder = queryResult(null);
    supabaseMock.from.mockImplementation((table: string) =>
      table === "posts" ? postsBuilder : flagsBuilder
    );

    await resolveFlag({ id: "f1", post_id: "p1" } as never, "remove");

    expect(postsBuilder.update).toHaveBeenCalledWith({ is_deleted: true });
    expect(flagsBuilder.update).toHaveBeenCalledWith({ status: "resolved" });
    expect(postsBuilder.update).toHaveBeenCalledWith({ flag_status: "reviewed" });
  });

  it("only sets the flag dismissed on 'dismiss', without touching is_deleted", async () => {
    const postsBuilder = queryResult(null);
    const flagsBuilder = queryResult(null);
    supabaseMock.from.mockImplementation((table: string) =>
      table === "posts" ? postsBuilder : flagsBuilder
    );

    await resolveFlag({ id: "f1", post_id: "p1" } as never, "dismiss");

    expect(postsBuilder.update).not.toHaveBeenCalledWith({ is_deleted: true });
    expect(flagsBuilder.update).toHaveBeenCalledWith({ status: "dismissed" });
  });

  it("skips post updates entirely when the flag has no post_id", async () => {
    const flagsBuilder = queryResult(null);
    supabaseMock.from.mockReturnValue(flagsBuilder);

    await resolveFlag({ id: "f1", post_id: null } as never, "remove");
    expect(supabaseMock.from).not.toHaveBeenCalledWith("posts");
  });
});
