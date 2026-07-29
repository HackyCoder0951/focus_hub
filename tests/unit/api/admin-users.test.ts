import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const { fetchAdminUsers, updateUserStatus, removeUserProfile } = await import(
  "@/features/admin/api/users"
);

beforeEach(() => {
  supabaseMock.from.mockReset();
});

describe("fetchAdminUsers", () => {
  it("defaults a missing status to 'active'", async () => {
    supabaseMock.from.mockReturnValue(
      queryResult([{ id: "u1", full_name: "A", email: "a@x.com", avatar_url: null, created_at: "x", status: null }])
    );
    const [user] = await fetchAdminUsers();
    expect(user.status).toBe("active");
  });

  it("preserves an explicit status", async () => {
    supabaseMock.from.mockReturnValue(
      queryResult([{ id: "u1", status: "banned" }])
    );
    const [user] = await fetchAdminUsers();
    expect(user.status).toBe("banned");
  });

  it("orders by created_at descending", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchAdminUsers();
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

describe("updateUserStatus / removeUserProfile", () => {
  it("updates the status for the given user id", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await updateUserStatus("u1", "banned");
    expect(builder.update).toHaveBeenCalledWith({ status: "banned" });
    expect(builder.eq).toHaveBeenCalledWith("id", "u1");
  });

  it("throws when the status update errors", async () => {
    supabaseMock.from.mockReturnValue(queryResult(null, { message: "fail" }));
    await expect(updateUserStatus("u1", "banned")).rejects.toBeTruthy();
  });

  it("deletes the profile row by id", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await removeUserProfile("u1");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("id", "u1");
  });
});
