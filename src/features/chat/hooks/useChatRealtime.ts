import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { qk } from "@/shared/lib/queryKeys";
import type { ChatMessage, MessageWithAuthor } from "@/shared/types/db";
import type { ChatWithDetails } from "../types";
import { appendMessageToCache } from "./useMessages";

/**
 * Realtime INSERTs for the open chat: appends `payload.new` straight
 * into the react-query messages cache (no refetch), enriching the
 * author profile from the chats-list cache.
 */
export function useChatRealtime(chatId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat-messages-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const row = payload.new as ChatMessage;
          const chats = queryClient.getQueryData<ChatWithDetails[]>(
            qk.chat.list
          );
          const author =
            chats
              ?.find((c) => c.id === chatId)
              ?.chat_members.find((m) => m.user_id === row.user_id)
              ?.profiles ?? null;
          const message: MessageWithAuthor = { ...row, profiles: author };
          appendMessageToCache(queryClient, chatId, message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, queryClient]);
}

/**
 * Light global subscription: any new chat message invalidates the
 * chat list so ordering + last-message previews stay fresh.
 */
export function useChatListRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("chat-list-updates")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: qk.chat.list });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
