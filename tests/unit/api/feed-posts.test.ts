import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    from: vi.fn(),
    storage: { from: vi.fn() },
  },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { fetchPostsPage, createPost, updatePost, softDeletePost, uploadPostImage, PAGE_SIZE } = await import(
  "@/features/feed/api/posts"
);

beforeEach(() => {
  supabaseMock.from.mockReset();
  supabaseMock.storage.from.mockReset();
});

describe("fetchPostsPage", () => {
  it("remaps the joined likes_count array into a plain number", async () => {
    const builder = queryResult([
      { id: "1", content: "hi", likes_count: [{ count: 3 }] },
      { id: "2", content: "no likes", likes_count: [] },
      { id: "3", content: "null likes", likes_count: null },
    ]);
    supabaseMock.from.mockReturnValue(builder);

    const result = await fetchPostsPage({});
    expect(result[0].likes_count).toBe(3);
    expect(result[1].likes_count).toBe(0);
    expect(result[2].likes_count).toBe(0);
  });

  it("queries the posts table, excluding soft-deleted rows, newest first", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);

    await fetchPostsPage({});
    expect(supabaseMock.from).toHaveBeenCalledWith("posts");
    expect(builder.eq).toHaveBeenCalledWith("is_deleted", false);
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("paginates using pageParam * PAGE_SIZE", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);

    await fetchPostsPage({ pageParam: 2 });
    expect(builder.range).toHaveBeenCalledWith(2 * PAGE_SIZE, 2 * PAGE_SIZE + PAGE_SIZE - 1);
  });

  it("does not apply a search filter when search is empty", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);

    await fetchPostsPage({ search: "   " });
    expect(builder.or).not.toHaveBeenCalled();
  });

  it("applies a sanitized ilike search filter, stripping characters that break PostgREST syntax", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);

    await fetchPostsPage({ search: "hello, (world)" });
    expect(builder.or).toHaveBeenCalledWith("content.ilike.%hello   world%");
  });

  it("throws when the query errors", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { message: "boom" }));
    await expect(fetchPostsPage({})).rejects.toBeTruthy();
  });

  it("returns an empty array when data is null", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null));
    expect(await fetchPostsPage({})).toEqual([]);
  });
});

describe("createPost", () => {
  it("inserts with the given user, content, and image", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);

    await createPost({ userId: "u1", content: "hello", imageUrl: "http://x/a.png" });
    expect(supabaseMock.from).toHaveBeenCalledWith("posts");
    expect(builder.insert).toHaveBeenCalledWith({
      user_id: "u1",
      content: "hello",
      image_url: "http://x/a.png",
    });
  });

  it("defaults image_url to null when omitted", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);

    await createPost({ userId: "u1", content: "hello" });
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ image_url: null })
    );
  });

  it("throws when the insert errors", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { message: "fail" }));
    await expect(createPost({ userId: "u1", content: "x" })).rejects.toBeTruthy();
  });
});

describe("updatePost", () => {
  it("updates content and targets the correct row", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);

    await updatePost("post-1", "new content");
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ content: "new content" })
    );
    expect(builder.eq).toHaveBeenCalledWith("id", "post-1");
  });
});

describe("softDeletePost", () => {
  it("sets is_deleted true rather than removing the row", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);

    await softDeletePost("post-1");
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ is_deleted: true })
    );
    expect(builder.eq).toHaveBeenCalledWith("id", "post-1");
  });
});

describe("uploadPostImage", () => {
  it("uploads to the post-media bucket and returns the public URL", async () => {
    const upload = vi.fn().mockResolvedValue({ data: { path: "images/123_a.png" }, error: null });
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: "https://mock/post-media/images/123_a.png" } });
    supabaseMock.storage.from.mockReturnValue({ upload, getPublicUrl, remove: vi.fn() });

    const file = new File(["content"], "a.png", { type: "image/png" });
    const url = await uploadPostImage(file);

    expect(supabaseMock.storage.from).toHaveBeenCalledWith("post-media");
    expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^images\/\d+_a\.png$/), file, { upsert: true });
    expect(url).toBe("https://mock/post-media/images/123_a.png");
  });

  it("throws when the upload errors", async () => {
    supabaseMock.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: { message: "upload failed" } }),
      getPublicUrl: vi.fn(),
    });

    const file = new File(["x"], "a.png");
    await expect(uploadPostImage(file)).rejects.toBeTruthy();
  });
});
