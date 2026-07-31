import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult, countResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const {
  PROFILE_SELECT,
  fetchProfile,
  fetchProfileRole,
  fetchUserPosts,
  fetchUserFiles,
  fetchFollowStats,
  fetchIsFollowing,
  followUser,
  unfollowUser,
  fetchProfileActivity,
  fetchQaStats,
  fetchFollowersList,
  fetchFollowingList,
  fetchMyFollowingIds,
} = await import("@/features/profile/api/profile");

beforeEach(() => {
  supabaseMock.from.mockReset();
});

describe("fetchProfile / fetchProfileRole", () => {
  it("returns null (not an error) when no profile row exists", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { code: "PGRST116", message: "no rows" }));
    expect(await fetchProfile("u1")).toBeNull();
  });

  it("returns the profile row when found", async () => {
    const builder = queryResult({ id: "u1", full_name: "A" });
    supabaseMock.from.mockReturnValue(builder);
    expect(await fetchProfile("u1")).toEqual({ id: "u1", full_name: "A" });
    expect(builder.select).toHaveBeenCalledWith(PROFILE_SELECT);
  });

  it("returns null role when the user has no role row", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { code: "PGRST116" }));
    expect(await fetchProfileRole("u1")).toBeNull();
  });

  it("returns the role string when found", async () => {
    supabaseMock.from.mockReturnValue(queryResult({ role: "admin" }));
    expect(await fetchProfileRole("u1")).toBe("admin");
  });
});

describe("fetchUserPosts / fetchUserFiles", () => {
  it("filters posts by user, excludes soft-deleted, newest first", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchUserPosts("u1");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(builder.eq).toHaveBeenCalledWith("is_deleted", false);
  });

  it("returns [] for user files when there is no data", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null));
    expect(await fetchUserFiles("u1")).toEqual([]);
  });
});

describe("fetchFollowStats", () => {
  it("returns follower and following counts from two separate count queries", async () => {
    supabaseMock.from
      .mockReturnValueOnce(countResult(5))
      .mockReturnValueOnce(countResult(3));
    const stats = await fetchFollowStats("u1");
    expect(stats).toEqual({ followers: 5, following: 3 });
  });

  it("defaults null counts to 0", async () => {
    supabaseMock.from
      .mockReturnValueOnce(countResult(null as unknown as number))
      .mockReturnValueOnce(countResult(null as unknown as number));
    expect(await fetchFollowStats("u1")).toEqual({ followers: 0, following: 0 });
  });

  it("throws if either count query errors", async () => {
    supabaseMock.from
      .mockReturnValueOnce(countResult(0, { message: "fail" }))
      .mockReturnValueOnce(countResult(0));
    await expect(fetchFollowStats("u1")).rejects.toBeTruthy();
  });
});

describe("fetchIsFollowing / followUser / unfollowUser", () => {
  it("returns true when a follow row exists", async () => {
    supabaseMock.from.mockReturnValue(queryResult({ id: "f1" }));
    expect(await fetchIsFollowing("viewer", "target")).toBe(true);
  });

  it("returns false when no follow row exists", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { code: "PGRST116" }));
    expect(await fetchIsFollowing("viewer", "target")).toBe(false);
  });

  it("followUser inserts a followers row", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await followUser("viewer", "target");
    expect(builder.insert).toHaveBeenCalledWith({ follower_id: "viewer", following_id: "target" });
  });

  it("unfollowUser deletes the matching followers row", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await unfollowUser("viewer", "target");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("follower_id", "viewer");
    expect(builder.eq).toHaveBeenCalledWith("following_id", "target");
  });
});

describe("fetchProfileActivity", () => {
  it("merges posts/questions/answers/files into one timeline sorted newest-first", async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "posts") return queryResult([{ id: 1, content: "post", created_at: "2026-01-01T00:00:00Z" }]);
      if (table === "questions") return queryResult([{ id: 2, title: "question", created_at: "2026-03-01T00:00:00Z" }]);
      if (table === "answers") return queryResult([{ id: 3, body: "answer", created_at: "2026-02-01T00:00:00Z" }]);
      if (table === "filemodels") return queryResult([{ id: 4, file_name: "file.txt", created_at: "2026-04-01T00:00:00Z" }]);
      return queryResult([]);
    });

    const result = await fetchProfileActivity("u1");
    expect(result.map((i) => i.id)).toEqual(["file-4", "question-2", "answer-3", "post-1"]);
    expect(result[0].type).toBe("file");
  });

  it("caps the timeline at 20 items", async () => {
    const many = (prefix: string, table: string) =>
      Array.from({ length: 10 }, (_, i) => ({
        id: `${table}-${i}`,
        content: `${prefix}${i}`,
        title: `${prefix}${i}`,
        body: `${prefix}${i}`,
        file_name: `${prefix}${i}`,
        created_at: new Date(2026, 0, i + 1).toISOString(),
      }));
    supabaseMock.from.mockImplementation((table: string) => queryResult(many("x", table)));
    const result = await fetchProfileActivity("u1");
    expect(result.length).toBeLessThanOrEqual(20);
  });
});

describe("fetchQaStats", () => {
  it("returns questionsAsked/answersGiven/acceptedAnswers from three count queries", async () => {
    supabaseMock.from
      .mockReturnValueOnce(countResult(7))
      .mockReturnValueOnce(countResult(4))
      .mockReturnValueOnce(countResult(2));
    expect(await fetchQaStats("u1")).toEqual({
      questionsAsked: 7,
      answersGiven: 4,
      acceptedAnswers: 2,
    });
  });
});

describe("fetchFollowersList / fetchFollowingList / fetchMyFollowingIds", () => {
  it("preserves recency order and fills in placeholders for missing profiles", async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "followers") {
        return queryResult([{ follower_id: "u2" }, { follower_id: "u3" }]);
      }
      if (table === "profiles") {
        // Only u3's profile "exists"; u2 is missing (e.g. deleted account).
        return queryResult([{ id: "u3", full_name: "Three", avatar_url: null, bio: null }]);
      }
      return queryResult([]);
    });

    const result = await fetchFollowersList("u1");
    expect(result.map((r) => r.id)).toEqual(["u2", "u3"]);
    expect(result[0]).toEqual({ id: "u2", full_name: null, avatar_url: null, bio: null });
    expect(result[1].full_name).toBe("Three");
  });

  it("returns [] without querying profiles when there are no ids", async () => {
    supabaseMock.from.mockImplementation((table: string) =>
      table === "followers" ? queryResult([]) : queryResult([])
    );
    const result = await fetchFollowingList("u1");
    expect(result).toEqual([]);
    expect(supabaseMock.from).not.toHaveBeenCalledWith("profiles");
  });

  it("fetchMyFollowingIds filters out null ids", async () => {
    supabaseMock.from.mockReturnValue(
      queryResult([{ following_id: "u2" }, { following_id: null }])
    );
    expect(await fetchMyFollowingIds("u1")).toEqual(["u2"]);
  });
});
