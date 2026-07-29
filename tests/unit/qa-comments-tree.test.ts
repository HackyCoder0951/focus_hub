import { describe, it, expect } from "vitest";
import { buildCommentTree, type CommentWithAuthor } from "@/features/qa/api/comments";

function makeComment(overrides: Partial<CommentWithAuthor>): CommentWithAuthor {
  return {
    id: 1,
    answer_id: 100,
    user_id: "u1",
    parent_comment_id: null,
    body: "hello",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    profiles: null,
    ...overrides,
  } as CommentWithAuthor;
}

describe("buildCommentTree", () => {
  it("returns an empty array for no comments", () => {
    expect(buildCommentTree([])).toEqual([]);
  });

  it("treats comments with no parent as roots", () => {
    const comments = [makeComment({ id: 1 }), makeComment({ id: 2 })];
    const tree = buildCommentTree(comments);
    expect(tree).toHaveLength(2);
    expect(tree[0].replies).toEqual([]);
    expect(tree[1].replies).toEqual([]);
  });

  it("nests a reply under its parent", () => {
    const comments = [
      makeComment({ id: 1, parent_comment_id: null }),
      makeComment({ id: 2, parent_comment_id: 1 }),
    ];
    const tree = buildCommentTree(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe(1);
    expect(tree[0].replies).toHaveLength(1);
    expect(tree[0].replies[0].id).toBe(2);
  });

  it("supports multi-level nesting", () => {
    const comments = [
      makeComment({ id: 1, parent_comment_id: null }),
      makeComment({ id: 2, parent_comment_id: 1 }),
      makeComment({ id: 3, parent_comment_id: 2 }),
    ];
    const tree = buildCommentTree(comments);
    expect(tree[0].replies[0].replies[0].id).toBe(3);
  });

  it("treats a comment whose parent is missing from the list as a root (orphan)", () => {
    const comments = [makeComment({ id: 2, parent_comment_id: 999 })];
    const tree = buildCommentTree(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe(2);
  });

  it("preserves multiple replies under the same parent in order", () => {
    const comments = [
      makeComment({ id: 1, parent_comment_id: null }),
      makeComment({ id: 2, parent_comment_id: 1 }),
      makeComment({ id: 3, parent_comment_id: 1 }),
    ];
    const tree = buildCommentTree(comments);
    expect(tree[0].replies.map((r) => r.id)).toEqual([2, 3]);
  });
});
