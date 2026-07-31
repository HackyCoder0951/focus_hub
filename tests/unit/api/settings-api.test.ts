import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn(), storage: { from: vi.fn() } },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { updateProfileRow, uploadAvatar, fetchAccountExport, downloadJson } = await import(
  "@/features/settings/api/settingsApi"
);

beforeEach(() => {
  supabaseMock.from.mockReset();
  supabaseMock.storage.from.mockReset();
});

describe("updateProfileRow", () => {
  it("updates the given user's profile row and returns the fresh row", async () => {
    const builder = queryResult({ id: "u1", full_name: "New Name" });
    supabaseMock.from.mockReturnValue(builder);

    const result = await updateProfileRow("u1", { full_name: "New Name" });
    expect(builder.update).toHaveBeenCalledWith({ full_name: "New Name" });
    expect(builder.eq).toHaveBeenCalledWith("id", "u1");
    expect(builder.select).toHaveBeenCalledWith(
      expect.stringContaining("bio")
    );
    expect(builder.select).toHaveBeenCalledWith(
      expect.stringContaining("member_type")
    );
    expect(result.full_name).toBe("New Name");
  });
});

describe("uploadAvatar", () => {
  it("uploads to the avatars bucket under a userId-prefixed path and returns the public URL", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: "https://mock/avatars/x" } });
    supabaseMock.storage.from.mockReturnValue({ upload, getPublicUrl, remove: vi.fn() });

    const url = await uploadAvatar("u1", new File(["x"], "me.png"));
    expect(supabaseMock.storage.from).toHaveBeenCalledWith("avatars");
    expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^u1\/\d+\.png$/), expect.any(File), { upsert: true });
    expect(url).toBe("https://mock/avatars/x");
  });

  it("uses the whole filename as the extension when there is no dot (no real fallback occurs)", async () => {
    // `"noext".split(".").pop()` is "noext", never undefined, so the `?? "png"`
    // fallback in uploadAvatar is unreachable for any string input.
    const upload = vi.fn().mockResolvedValue({ error: null });
    supabaseMock.storage.from.mockReturnValue({
      upload,
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "https://mock/x" } }),
      remove: vi.fn(),
    });
    await uploadAvatar("u1", new File(["x"], "noext"));
    expect(upload).toHaveBeenCalledWith(expect.stringMatching(/^u1\/\d+\.noext$/), expect.any(File), expect.anything());
  });

  it("throws when the upload fails", async () => {
    supabaseMock.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
      getPublicUrl: vi.fn(),
    });
    await expect(uploadAvatar("u1", new File(["x"], "a.png"))).rejects.toBeTruthy();
  });
});

describe("fetchAccountExport", () => {
  it("gathers the profile, posts, and file metadata for the given user", async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "profiles") return queryResult({ id: "u1", full_name: "A" });
      if (table === "posts") return queryResult([{ id: "p1" }]);
      if (table === "filemodels") return queryResult([{ id: "f1" }]);
      return queryResult(null);
    });

    const result = await fetchAccountExport("u1");
    expect(result.profile).toEqual({ id: "u1", full_name: "A" });
    expect(result.posts).toEqual([{ id: "p1" }]);
    expect(result.files).toEqual([{ id: "f1" }]);
    expect(result.exported_at).toBeTruthy();
  });
});

describe("downloadJson", () => {
  it("creates an object URL, triggers a click, and revokes the URL", () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    downloadJson({ hello: "world" }, "export.json");

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
