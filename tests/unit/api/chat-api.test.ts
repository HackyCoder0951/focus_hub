import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryResult } from "../../mocks/supabase";

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn(), storage: { from: vi.fn() }, rpc: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: supabaseMock }));

const {
  fetchChats,
  fetchMessagesPage,
  uploadAttachment,
  insertMessage,
  fetchProfileOptions,
  createChat,
  renameGroup,
  addMember,
  removeMember,
  setAdmin,
  leaveGroup,
  MESSAGES_PAGE_SIZE,
} = await import("@/features/chat/api");

beforeEach(() => {
  supabaseMock.from.mockReset();
  supabaseMock.storage.from.mockReset();
  supabaseMock.rpc.mockReset();
});

describe("fetchChats", () => {
  it("filters out memberships whose chat join came back null", async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "chat_members") {
        return queryResult([
          { chat_id: "c1", chats: { id: "c1", created_at: "2026-01-01T00:00:00Z", chat_members: [] } },
          { chat_id: null, chats: null },
        ]);
      }
      return queryResult([]);
    });

    const result = await fetchChats("u1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c1");
  });

  it("skips the last-message query entirely when there are no chats", async () => {
    supabaseMock.from.mockImplementation((table: string) =>
      table === "chat_members" ? queryResult([]) : queryResult([])
    );
    await fetchChats("u1");
    expect(supabaseMock.from).not.toHaveBeenCalledWith("chat_messages");
  });

  it("attaches the newest message per chat and sorts chats by most-recent activity", async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "chat_members") {
        return queryResult([
          { chat_id: "old", chats: { id: "old", created_at: "2026-01-01T00:00:00Z", chat_members: [] } },
          { chat_id: "new", chats: { id: "new", created_at: "2026-01-01T00:00:00Z", chat_members: [] } },
        ]);
      }
      if (table === "chat_messages") {
        return queryResult([
          { chat_id: "new", content: "hi", created_at: "2026-03-01T00:00:00Z", user_id: "u2", media_url: null },
          { chat_id: "old", content: "hey", created_at: "2026-02-01T00:00:00Z", user_id: "u2", media_url: null },
        ]);
      }
      return queryResult([]);
    });

    const result = await fetchChats("u1");
    expect(result.map((c) => c.id)).toEqual(["new", "old"]);
    expect(result[0].last_message?.content).toBe("hi");
  });

  it("falls back to the chat's own created_at for sorting when there's no last message", async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "chat_members") {
        return queryResult([
          { chat_id: "c1", chats: { id: "c1", created_at: "2026-01-01T00:00:00Z", chat_members: [] } },
        ]);
      }
      return queryResult([]);
    });
    const result = await fetchChats("u1");
    expect(result[0].last_message).toBeNull();
  });
});

describe("fetchMessagesPage", () => {
  it("returns messages in ascending order (reversed from the descending DB query)", async () => {
    supabaseMock.from.mockReturnValue(
      queryResult([
        { id: 2, created_at: "2026-01-02T00:00:00Z" },
        { id: 1, created_at: "2026-01-01T00:00:00Z" },
      ])
    );
    const page = await fetchMessagesPage("c1");
    expect(page.messages.map((m: { id: number }) => m.id)).toEqual([1, 2]);
  });

  it("sets nextCursor to the oldest message's created_at when a full page is returned", async () => {
    // The DB query orders newest-first, so index 0 here is the newest row
    // and the last index is the oldest — matching real query results.
    const fullPage = Array.from({ length: MESSAGES_PAGE_SIZE }, (_, i) => ({
      id: i,
      created_at: `2026-01-${String(MESSAGES_PAGE_SIZE - i).padStart(2, "0")}T00:00:00Z`,
    }));
    const oldest = fullPage[fullPage.length - 1];
    supabaseMock.from.mockReturnValue(queryResult(fullPage));
    const page = await fetchMessagesPage("c1");
    expect(page.nextCursor).toBe(oldest.created_at);
  });

  it("leaves nextCursor undefined when fewer than a full page is returned", async () => {
    supabaseMock.from.mockReturnValue(queryResult([{ id: 1, created_at: "2026-01-01T00:00:00Z" }]));
    const page = await fetchMessagesPage("c1");
    expect(page.nextCursor).toBeUndefined();
  });

  it("applies a before cursor filter only when given", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchMessagesPage("c1", "2026-01-01T00:00:00Z");
    expect(builder.lt).toHaveBeenCalledWith("created_at", "2026-01-01T00:00:00Z");
  });
});

describe("uploadAttachment / insertMessage", () => {
  it("uploads to the chat_uploads bucket and returns the public URL", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: "https://mock/chat_uploads/x" } });
    supabaseMock.storage.from.mockReturnValue({ upload, getPublicUrl, remove: vi.fn() });

    const url = await uploadAttachment("u1", new File(["x"], "a.png"));
    expect(supabaseMock.storage.from).toHaveBeenCalledWith("chat_uploads");
    expect(url).toBe("https://mock/chat_uploads/x");
  });

  it("throws when the attachment upload fails", async () => {
    supabaseMock.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
      getPublicUrl: vi.fn(),
    });
    await expect(uploadAttachment("u1", new File(["x"], "a.png"))).rejects.toBeTruthy();
  });

  it("inserts a message defaulting mediaUrl to null", async () => {
    const builder = queryResult({ id: 1 });
    supabaseMock.from.mockReturnValue(builder);
    await insertMessage({ chatId: "c1", userId: "u1", content: "hi" });
    expect(builder.insert).toHaveBeenCalledWith({
      chat_id: "c1",
      user_id: "u1",
      content: "hi",
      media_url: null,
    });
  });
});

describe("fetchProfileOptions", () => {
  it("excludes the given userId when provided", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchProfileOptions("u1");
    expect(builder.neq).toHaveBeenCalledWith("id", "u1");
  });

  it("does not filter when no userId is given", async () => {
    const builder = queryResult([]);
    supabaseMock.from.mockReturnValue(builder);
    await fetchProfileOptions();
    expect(builder.neq).not.toHaveBeenCalled();
  });
});

describe("createChat", () => {
  it("creates the chat then inserts the creator plus deduped member rows", async () => {
    const chatsBuilder = queryResult({ id: "c1" });
    const membersBuilder = queryResult(null);
    supabaseMock.from.mockImplementation((table: string) =>
      table === "chats" ? chatsBuilder : membersBuilder
    );

    await createChat({ creatorId: "u1", memberIds: ["u1", "u2"], isGroup: true, name: "Group" });

    expect(chatsBuilder.insert).toHaveBeenCalledWith({
      is_group: true,
      name: "Group",
      created_by: "u1",
    });
    expect(membersBuilder.insert).toHaveBeenCalledWith([
      { chat_id: "c1", user_id: "u1", is_admin: true },
      { chat_id: "c1", user_id: "u2", is_admin: false },
    ]);
  });

  it("nulls the name for non-group (1:1) chats", async () => {
    const chatsBuilder = queryResult({ id: "c1" });
    supabaseMock.from.mockReturnValue(chatsBuilder);
    await createChat({ creatorId: "u1", memberIds: ["u2"], isGroup: false, name: "ignored" });
    expect(chatsBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ is_group: false, name: null })
    );
  });
});

describe("group admin mutations", () => {
  it("renameGroup updates the chat's name by id", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await renameGroup("c1", "New Name");
    expect(builder.update).toHaveBeenCalledWith({ name: "New Name" });
    expect(builder.eq).toHaveBeenCalledWith("id", "c1");
  });

  it("addMember inserts a non-admin member row", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await addMember("c1", "u2");
    expect(builder.insert).toHaveBeenCalledWith({ chat_id: "c1", user_id: "u2", is_admin: false });
  });

  it("removeMember deletes by chat and user", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await removeMember("c1", "u2");
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("chat_id", "c1");
    expect(builder.eq).toHaveBeenCalledWith("user_id", "u2");
  });

  it("setAdmin updates the is_admin flag", async () => {
    const builder = queryResult(null);
    supabaseMock.from.mockReturnValue(builder);
    await setAdmin("c1", "u2", true);
    expect(builder.update).toHaveBeenCalledWith({ is_admin: true });
  });

  it("leaveGroup calls the leave_group RPC with the chat and user ids", async () => {
    supabaseMock.rpc.mockResolvedValue({ error: null });
    await leaveGroup("c1", "u1");
    expect(supabaseMock.rpc).toHaveBeenCalledWith("leave_group", { p_chat_id: "c1", p_user_id: "u1" });
  });

  it("leaveGroup throws when the RPC errors", async () => {
    supabaseMock.rpc.mockResolvedValue({ error: { message: "fail" } });
    await expect(leaveGroup("c1", "u1")).rejects.toBeTruthy();
  });
});
