import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const {
  fetchComments,
  addComment,
  updateComment,
  deleteComment,
  fetchMyLikedCommentIds,
  toggleCommentLike,
} = await import("@/features/feed/api/comments");

beforeEach(() => {
  supabaseMock.from.mockReset();
});

describe("fetchComments", () => {
  it("queries comments for the given post, oldest first", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);

    await fetchComments("post-1");
    expect(supabaseMock.from).toHaveBeenCalledWith("comments");
    expect(builder.eq).toHaveBeenCalledWith("post_id", "post-1");
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: true });
  });

  it("returns an empty array when there are no rows", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null));
    expect(await fetchComments("post-1")).toEqual([]);
  });

  it("throws on error", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { message: "fail" }));
    await expect(fetchComments("post-1")).rejects.toBeTruthy();
  });
});

describe("addComment", () => {
  it("inserts with post/user/content and defaults parentId to null", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);

    await addComment({ postId: "p1", userId: "u1", content: "hi" });
    expect(builder.insert).toHaveBeenCalledWith({
      post_id: "p1",
      user_id: "u1",
      content: "hi",
      parent_id: null,
    });
  });

  it("passes through an explicit parentId for replies", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);

    await addComment({ postId: "p1", userId: "u1", content: "hi", parentId: "c1" });
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ parent_id: "c1" })
    );
  });
});

describe("updateComment / deleteComment", () => {
  it("updates the comment's content by id", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await updateComment("c1", "edited");
    expect(builder.update).toHaveBeenCalledWith({ content: "edited" });
    expect(builder.eq).toHaveBeenCalledWith("id", "c1");
  });

  it("deletes the comment by id", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await deleteComment("c1");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("id", "c1");
  });
});

describe("fetchMyLikedCommentIds", () => {
  it("returns [] immediately without querying when commentIds is empty", async () => {
    const result = await fetchMyLikedCommentIds([], "u1");
    expect(result).toEqual([]);
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("filters out null/falsy comment ids", async () => {
    supabaseMock.from.mockReturnValue(
      queryResult([{ comment_id: "c1" }, { comment_id: null }])
    );
    const result = await fetchMyLikedCommentIds(["c1", "c2"], "u1");
    expect(result).toEqual(["c1"]);
  });

  it("queries with the given user and comment id filters", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchMyLikedCommentIds(["c1", "c2"], "u1");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u1");
    expect(builder.in).toHaveBeenCalledWith("comment_id", ["c1", "c2"]);
  });
});

describe("toggleCommentLike", () => {
  it("deletes the like row when currently liked", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await toggleCommentLike("c1", "u1", true);
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("comment_id", "c1");
  });

  it("inserts a like row when not currently liked", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await toggleCommentLike("c1", "u1", false);
    expect(builder.insert).toHaveBeenCalledWith({ comment_id: "c1", user_id: "u1" });
  });
});
