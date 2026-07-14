import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { qk } from "@/shared/lib/queryKeys";
import { toast } from "@/hooks/use-toast";
import type { MessageWithAuthor } from "@/shared/types/db";
import { insertMessage, uploadAttachment } from "../api";
import {
  appendMessageToCache,
  removeMessageFromCache,
  type MessagesCache,
} from "./useMessages";

export interface SendMessageInput {
  content: string;
  file?: File | null;
}

interface SendMessageContext {
  tempId: string;
  tempMediaUrl: string | null;
  previous: MessagesCache | undefined;
}

/**
 * Sends a text and/or attachment message with an optimistic append
 * to the messages cache; rolls back on error.
 */
export function useSendMessage(chatId: string | null) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<MessageWithAuthor, Error, SendMessageInput, SendMessageContext>({
    mutationFn: async ({ content, file }) => {
      if (!chatId || !user) throw new Error("Not in a chat");
      const mediaUrl = file ? await uploadAttachment(user.id, file) : null;
      return insertMessage({
        chatId,
        userId: user.id,
        content: content.trim(),
        mediaUrl,
      });
    },
    onMutate: async ({ content, file }) => {
      if (!chatId || !user) {
        return { tempId: "", tempMediaUrl: null, previous: undefined };
      }
      await queryClient.cancelQueries({ queryKey: qk.chat.messages(chatId) });
      const previous = queryClient.getQueryData<MessagesCache>(
        qk.chat.messages(chatId)
      );

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const tempMediaUrl = file ? URL.createObjectURL(file) : null;
      const optimistic: MessageWithAuthor = {
        id: tempId,
        chat_id: chatId,
        user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        media_url: tempMediaUrl,
        profiles: profile
          ? {
              id: profile.id,
              full_name: profile.full_name,
              avatar_url: profile.avatar_url,
            }
          : null,
      };
      appendMessageToCache(queryClient, chatId, optimistic);
      return { tempId, tempMediaUrl, previous };
    },
    onSuccess: (message, _input, context) => {
      if (!chatId) return;
      // Swap the optimistic row for the server row (realtime may have
      // already appended it — appendMessageToCache de-dupes by id).
      removeMessageFromCache(queryClient, chatId, context.tempId);
      appendMessageToCache(queryClient, chatId, message);
      queryClient.invalidateQueries({ queryKey: qk.chat.list });
    },
    onError: (error, _input, context) => {
      if (chatId && context?.previous) {
        queryClient.setQueryData(qk.chat.messages(chatId), context.previous);
      } else if (chatId && context) {
        removeMessageFromCache(queryClient, chatId, context.tempId);
      }
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: (_message, _error, _input, context) => {
      if (context?.tempMediaUrl) URL.revokeObjectURL(context.tempMediaUrl);
    },
  });
}
