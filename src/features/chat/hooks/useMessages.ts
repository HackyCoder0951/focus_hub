import { useMemo } from "react";
import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import type { MessageWithAuthor } from "@/shared/types/db";
import { fetchMessagesPage, type MessagesPage } from "../api";

export type MessagesCache = InfiniteData<MessagesPage, string | undefined>;

/**
 * Paged messages for a chat. Pages are fetched newest-first
 * (page 0 = latest ~30, next pages go further back); `messages`
 * is the flattened, ascending list for display.
 */
export function useMessages(chatId: string | null) {
  const query = useInfiniteQuery({
    queryKey: qk.chat.messages(chatId ?? ""),
    queryFn: ({ pageParam }) => fetchMessagesPage(chatId!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!chatId,
  });

  const messages = useMemo<MessageWithAuthor[]>(
    () =>
      query.data
        ? [...query.data.pages].reverse().flatMap((page) => page.messages)
        : [],
    [query.data]
  );

  return { ...query, messages };
}

/**
 * Appends a message to the newest page of the messages cache
 * (no refetch). De-dupes by id so realtime echoes of optimistic
 * sends are ignored.
 */
export function appendMessageToCache(
  queryClient: QueryClient,
  chatId: string,
  message: MessageWithAuthor
) {
  queryClient.setQueryData<MessagesCache>(
    qk.chat.messages(chatId),
    (old) => {
      if (!old || old.pages.length === 0) return old;
      if (old.pages.some((p) => p.messages.some((m) => m.id === message.id))) {
        return old;
      }
      const pages = [...old.pages];
      pages[0] = { ...pages[0], messages: [...pages[0].messages, message] };
      return { ...old, pages };
    }
  );
}

/** Removes a message (e.g. an optimistic temp row) from the cache. */
export function removeMessageFromCache(
  queryClient: QueryClient,
  chatId: string,
  messageId: string
) {
  queryClient.setQueryData<MessagesCache>(
    qk.chat.messages(chatId),
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          messages: page.messages.filter((m) => m.id !== messageId),
        })),
      };
    }
  );
}
