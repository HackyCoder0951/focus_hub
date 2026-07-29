import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn(), storage: { from: vi.fn() } },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { fetchFiles, uploadFile, deleteFile, updateFileMeta } = await import(
  "@/features/resources/api/files"
);

beforeEach(() => {
  supabaseMock.from.mockReset();
  supabaseMock.storage.from.mockReset();
});

describe("fetchFiles", () => {
  it("orders by created_at descending", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchFiles();
    expect(supabaseMock.from).toHaveBeenCalledWith("filemodels");
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("returns an empty array when there is no data", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null));
    expect(await fetchFiles()).toEqual([]);
  });
});

describe("uploadFile", () => {
  it("uploads to the uploads bucket under a userId-prefixed path, then inserts the row", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: "https://mock/uploads/u1/1_a.txt" } });
    supabaseMock.storage.from.mockReturnValue({ upload, getPublicUrl, remove: vi.fn() });
    const insertBuilder = queryResult(null);
    supabaseMock.from.mockReturnValue(insertBuilder);

    const file = new File(["hello"], "a.txt", { type: "text/plain" });
    await uploadFile({ file, description: "  a note  ", isPublic: true, userId: "u1" });

    expect(supabaseMock.storage.from).toHaveBeenCalledWith("uploads");
    expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^u1\/\d+\.txt$/), file);
    expect(insertBuilder.insert).toHaveBeenCalledWith({
      user_id: "u1",
      file_url: "https://mock/uploads/u1/1_a.txt",
      file_name: "a.txt",
      file_type: "text/plain",
      file_size: file.size,
      description: "a note",
      is_public: true,
    });
  });

  it("stores a null description when it is blank after trimming", async () => {
    supabaseMock.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://mock/x" } }),
      remove: vi.fn(),
    });
    const insertBuilder = queryResult(null);
    supabaseMock.from.mockReturnValue(insertBuilder);

    const file = new File(["x"], "a.txt");
    await uploadFile({ file, description: "   ", isPublic: false, userId: "u1" });
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ description: null })
    );
  });

  it("throws and does not insert a row when the storage upload fails", async () => {
    supabaseMock.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: { message: "quota exceeded" } }),
      getPublicUrl: vi.fn(),
    });

    const file = new File(["x"], "a.txt");
    await expect(
      uploadFile({ file, description: "", isPublic: false, userId: "u1" })
    ).rejects.toBeTruthy();
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });
});

describe("deleteFile", () => {
  it("derives the storage path from the public URL and removes it, then deletes the row", async () => {
    const remove = vi.fn().mockResolvedValue({ error: null });
    supabaseMock.storage.from.mockReturnValue({ remove, upload: vi.fn(), getPublicUrl: vi.fn() });
    const deleteBuilder = queryResult(null);
    supabaseMock.from.mockReturnValue(deleteBuilder);

    await deleteFile({
      id: "f1",
      file_url: "https://mock.supabase.co/storage/v1/object/public/uploads/u1/123.txt",
    } as never);

    expect(remove).toHaveBeenCalledWith(["u1/123.txt"]);
    expect(deleteBuilder.delete).toHaveBeenCalled();
    expect(deleteBuilder.eq).toHaveBeenCalledWith("id", "f1");
  });

  it("still deletes the row even when the URL doesn't match the expected bucket marker", async () => {
    const deleteBuilder = queryResult(null);
    supabaseMock.from.mockReturnValue(deleteBuilder);

    await deleteFile({ id: "f1", file_url: "https://example.com/unrelated.txt" } as never);

    expect(supabaseMock.storage.from).not.toHaveBeenCalled();
    expect(deleteBuilder.delete).toHaveBeenCalled();
  });
});

describe("updateFileMeta", () => {
  it("updates description and visibility by id", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await updateFileMeta("f1", { description: "  hi  ", isPublic: true });
    expect(builder.update).toHaveBeenCalledWith({ description: "hi", is_public: true });
    expect(builder.eq).toHaveBeenCalledWith("id", "f1");
  });

  it("nulls out a blank description", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await updateFileMeta("f1", { description: "   ", isPublic: false });
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ description: null })
    );
  });
});
