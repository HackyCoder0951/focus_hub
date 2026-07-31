import { describe, it, expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import {
  appendMessageToCache,
  removeMessageFromCache,
  type MessagesCache,
} from "@/features/chat/hooks/useMessages";
import type { MessageWithAuthor } from "@/shared/types/db";

function makeMessage(overrides: Partial<MessageWithAuthor>): MessageWithAuthor {
  return { id: "m1", chat_id: "c1", content: "hi", created_at: "2026-01-01T00:00:00Z", ...overrides } as MessageWithAuthor;
}

function seedCache(queryClient: QueryClient, chatId: string, pages: MessagesCache["pages"]) {
  queryClient.setQueryData<MessagesCache>(qk.chat.messages(chatId), {
    pages,
    pageParams: pages.map(() => undefined),
  });
}

describe("appendMessageToCache", () => {
  it("appends the message to the first (newest) page", () => {
    const queryClient = new QueryClient();
    seedCache(queryClient, "c1", [{ messages: [makeMessage({ id: "m1" })], nextCursor: undefined }]);

    appendMessageToCache(queryClient, "c1", makeMessage({ id: "m2" }));

    const cache = queryClient.getQueryData<MessagesCache>(qk.chat.messages("c1"));
    expect(cache!.pages[0].messages.map((m) => m.id)).toEqual(["m1", "m2"]);
  });

  it("does nothing when there is no cached data yet", () => {
    const queryClient = new QueryClient();
    appendMessageToCache(queryClient, "c1", makeMessage({ id: "m1" }));
    expect(queryClient.getQueryData(qk.chat.messages("c1"))).toBeUndefined();
  });

  it("does nothing when the cache has zero pages", () => {
    const queryClient = new QueryClient();
    seedCache(queryClient, "c1", []);
    appendMessageToCache(queryClient, "c1", makeMessage({ id: "m1" }));
    const cache = queryClient.getQueryData<MessagesCache>(qk.chat.messages("c1"));
    expect(cache!.pages).toEqual([]);
  });

  it("de-dupes by id across all pages (ignores a realtime echo of an optimistic send)", () => {
    const queryClient = new QueryClient();
    seedCache(queryClient, "c1", [
      { messages: [makeMessage({ id: "m1" })], nextCursor: undefined },
      { messages: [makeMessage({ id: "m0" })], nextCursor: undefined },
    ]);

    appendMessageToCache(queryClient, "c1", makeMessage({ id: "m0" }));

    const cache = queryClient.getQueryData<MessagesCache>(qk.chat.messages("c1"));
    expect(cache!.pages[0].messages).toHaveLength(1);
    expect(cache!.pages[1].messages).toHaveLength(1);
  });

  it("only mutates the target chat's cache entry", () => {
    const queryClient = new QueryClient();
    seedCache(queryClient, "c1", [{ messages: [makeMessage({ id: "m1" })], nextCursor: undefined }]);
    seedCache(queryClient, "c2", [{ messages: [makeMessage({ id: "x1" })], nextCursor: undefined }]);

    appendMessageToCache(queryClient, "c1", makeMessage({ id: "m2" }));

    const c2 = queryClient.getQueryData<MessagesCache>(qk.chat.messages("c2"));
    expect(c2!.pages[0].messages).toHaveLength(1);
  });
});

describe("removeMessageFromCache", () => {
  it("removes the message with the matching id from every page", () => {
    const queryClient = new QueryClient();
    seedCache(queryClient, "c1", [
      { messages: [makeMessage({ id: "m1" }), makeMessage({ id: "temp-1" })], nextCursor: undefined },
    ]);

    removeMessageFromCache(queryClient, "c1", "temp-1");

    const cache = queryClient.getQueryData<MessagesCache>(qk.chat.messages("c1"));
    expect(cache!.pages[0].messages.map((m) => m.id)).toEqual(["m1"]);
  });

  it("does nothing when there is no cached data", () => {
    const queryClient = new QueryClient();
    expect(() => removeMessageFromCache(queryClient, "c1", "m1")).not.toThrow();
  });

  it("is a no-op when the id isn't present", () => {
    const queryClient = new QueryClient();
    seedCache(queryClient, "c1", [{ messages: [makeMessage({ id: "m1" })], nextCursor: undefined }]);
    removeMessageFromCache(queryClient, "c1", "does-not-exist");
    const cache = queryClient.getQueryData<MessagesCache>(qk.chat.messages("c1"));
    expect(cache!.pages[0].messages).toHaveLength(1);
  });
});
