import { describe, it, expect } from "vitest";
import {
  getChatDisplayName,
  getOtherMembers,
  getInitials,
  getLastMessagePreview,
  isImageUrl,
  getFileName,
  isUserOnline,
} from "@/features/chat/lib";
import type { ChatWithDetails } from "@/features/chat/types";

function makeChat(overrides: Partial<ChatWithDetails> = {}): ChatWithDetails {
  return {
    id: "chat-1",
    is_group: false,
    name: null,
    chat_members: [
      { user_id: "me", profiles: { full_name: "Me", avatar_url: null } },
      { user_id: "them", profiles: { full_name: "Alex Kumar", avatar_url: null } },
    ],
    ...overrides,
  } as ChatWithDetails;
}

describe("getChatDisplayName", () => {
  it("uses the group name for group chats", () => {
    const chat = makeChat({ is_group: true, name: "Study Group" });
    expect(getChatDisplayName(chat, "me")).toBe("Study Group");
  });

  it("uses the other member's name for 1:1 chats", () => {
    expect(getChatDisplayName(makeChat(), "me")).toBe("Alex Kumar");
  });

  it("falls back to Unknown User when the other member has no profile name", () => {
    const chat = makeChat({
      chat_members: [{ user_id: "me", profiles: { full_name: "Me", avatar_url: null } }],
    });
    expect(getChatDisplayName(chat, "me")).toBe("Unknown User");
  });
});

describe("getOtherMembers", () => {
  it("excludes the current user", () => {
    const members = getOtherMembers(makeChat(), "me");
    expect(members).toHaveLength(1);
    expect(members[0].user_id).toBe("them");
  });
});

describe("getInitials", () => {
  it("builds initials from first and last name", () => {
    expect(getInitials("Alex Kumar")).toBe("AK");
  });

  it("handles a single name", () => {
    expect(getInitials("Alex")).toBe("A");
  });

  it("returns empty string for missing name", () => {
    expect(getInitials(null)).toBe("");
    expect(getInitials(undefined)).toBe("");
  });
});

describe("getLastMessagePreview", () => {
  it("returns null when there is no last message", () => {
    expect(getLastMessagePreview(null, "me")).toBeNull();
  });

  it("prefixes 'You: ' when the current user sent it", () => {
    expect(
      getLastMessagePreview({ user_id: "me", content: "hi", media_url: null }, "me")
    ).toBe("You: hi");
  });

  it("does not prefix messages from other users", () => {
    expect(
      getLastMessagePreview({ user_id: "them", content: "hi", media_url: null }, "me")
    ).toBe("hi");
  });

  it("reports an attachment when there is media but no text content", () => {
    expect(
      getLastMessagePreview({ user_id: "me", content: null, media_url: "http://x/f.png" }, "me")
    ).toBe("You: Sent an attachment");
  });
});

describe("isUserOnline", () => {
  it("treats realtime presence as online immediately", () => {
    expect(
      isUserOnline(
        { id: "them", last_seen: null },
        new Set(["them"]),
        Date.parse("2026-01-01T00:00:00Z")
      )
    ).toBe(true);
  });

  it("falls back to recent last_seen when realtime presence is missing", () => {
    expect(
      isUserOnline(
        { id: "them", last_seen: "2026-01-01T00:00:30Z" },
        new Set(),
        Date.parse("2026-01-01T00:01:00Z")
      )
    ).toBe(true);
  });

  it("treats stale last_seen values as offline", () => {
    expect(
      isUserOnline(
        { id: "them", last_seen: "2026-01-01T00:00:00Z" },
        new Set(),
        Date.parse("2026-01-01T00:02:00Z")
      )
    ).toBe(false);
  });
});

describe("isImageUrl", () => {
  it("matches common image extensions case-insensitively", () => {
    expect(isImageUrl("http://x/photo.PNG")).toBe(true);
    expect(isImageUrl("http://x/photo.jpg")).toBe(true);
  });

  it("does not match non-image extensions", () => {
    expect(isImageUrl("http://x/doc.pdf")).toBe(false);
  });
});

describe("getFileName", () => {
  it("extracts and decodes the file name from a URL", () => {
    expect(getFileName("http://x/uploads/My%20File.pdf")).toBe("My File.pdf");
  });

  it("falls back to 'file' on malformed input", () => {
    expect(getFileName("http://x/uploads/%")).toBe("file");
  });
});
