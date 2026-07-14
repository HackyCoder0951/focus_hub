import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { Chat, ChatMember, MessageWithAuthor } from "@/shared/types/db";
import type {
  ChatMemberWithProfile,
  ChatWithDetails,
  LastMessagePreview,
  ProfileOption,
} from "./types";

export const MESSAGES_PAGE_SIZE = 30;

const MESSAGE_SELECT =
  "id, chat_id, user_id, content, created_at, media_url, profiles:user_id(id, full_name, avatar_url)";

type ChatMembershipRow = {
  chat_id: string | null;
  chats:
    | (Chat & {
        chat_members: ChatMemberWithProfile[];
      })
    | null;
};

/**
 * All chats for the current user in ONE nested select
 * (chat_members -> chats -> chat_members -> profiles),
 * plus one batched query for last-message previews.
 */
export async function fetchChats(userId: string): Promise<ChatWithDetails[]> {
  const memberships = await unwrap(
    supabase
      .from("chat_members")
      .select(
        `chat_id,
         chats (
           id, is_group, name, created_at, created_by,
           chat_members (
             id, chat_id, user_id, joined_at, is_admin,
             profiles:user_id (id, full_name, avatar_url)
           )
         )`
      )
      .eq("user_id", userId)
      .returns<ChatMembershipRow[]>()
  );

  const chats = memberships
    .map((row) => row.chats)
    .filter((chat): chat is NonNullable<ChatMembershipRow["chats"]> => chat !== null);

  const chatIds = chats.map((chat) => chat.id);
  const lastByChat = new Map<string, LastMessagePreview>();

  if (chatIds.length > 0) {
    // One batched query: newest messages across all chats, reduced
    // client-side to the latest per chat.
    const recent = await unwrap(
      supabase
        .from("chat_messages")
        .select("chat_id, content, created_at, user_id, media_url")
        .in("chat_id", chatIds)
        .order("created_at", { ascending: false })
        .limit(Math.min(chatIds.length * 25, 500))
        .returns<LastMessagePreview[]>()
    );
    for (const message of recent) {
      if (message.chat_id && !lastByChat.has(message.chat_id)) {
        lastByChat.set(message.chat_id, message);
      }
    }
  }

  return chats
    .map((chat) => ({
      ...chat,
      last_message: lastByChat.get(chat.id) ?? null,
    }))
    .sort(
      (a, b) =>
        new Date(b.last_message?.created_at ?? b.created_at).getTime() -
        new Date(a.last_message?.created_at ?? a.created_at).getTime()
    );
}

export type MessagesPage = {
  messages: MessageWithAuthor[];
  /** created_at cursor of the oldest message, when more exist. */
  nextCursor: string | undefined;
};

/** One page of messages (newest first in DB, returned ascending). */
export async function fetchMessagesPage(
  chatId: string,
  before?: string
): Promise<MessagesPage> {
  let query = supabase
    .from("chat_messages")
    .select(MESSAGE_SELECT)
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(MESSAGES_PAGE_SIZE);
  if (before) query = query.lt("created_at", before);

  const rows = await unwrap(query.returns<MessageWithAuthor[]>());
  const messages = [...rows].reverse();
  return {
    messages,
    nextCursor:
      rows.length === MESSAGES_PAGE_SIZE ? messages[0]?.created_at : undefined,
  };
}

/** Full history for a chat (used by export-to-text only). */
export async function fetchAllMessages(
  chatId: string
): Promise<MessageWithAuthor[]> {
  return unwrap(
    supabase
      .from("chat_messages")
      .select(MESSAGE_SELECT)
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .returns<MessageWithAuthor[]>()
  );
}

/** Uploads a file to the `chat_uploads` bucket, returns its public URL. */
export async function uploadAttachment(
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("chat_uploads")
    .upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("chat_uploads").getPublicUrl(path);
  return data.publicUrl;
}

/** Inserts a message and returns it joined with the author profile. */
export async function insertMessage(input: {
  chatId: string;
  userId: string;
  content: string;
  mediaUrl?: string | null;
}): Promise<MessageWithAuthor> {
  return unwrap(
    supabase
      .from("chat_messages")
      .insert({
        chat_id: input.chatId,
        user_id: input.userId,
        content: input.content,
        media_url: input.mediaUrl ?? null,
      })
      .select(MESSAGE_SELECT)
      .single()
      .returns<MessageWithAuthor>()
  );
}

/** All profiles except the current user (for user pickers). */
export async function fetchProfileOptions(
  excludeUserId?: string
): Promise<ProfileOption[]> {
  let query = supabase
    .from("profiles")
    .select("id, full_name, avatar_url, email")
    .order("full_name");
  if (excludeUserId) query = query.neq("id", excludeUserId);
  return unwrap(query.returns<ProfileOption[]>());
}

/** Creates a chat plus all member rows; returns the new chat. */
export async function createChat(input: {
  creatorId: string;
  memberIds: string[];
  isGroup: boolean;
  name: string | null;
}): Promise<Chat> {
  const chat = await unwrap(
    supabase
      .from("chats")
      .insert({
        is_group: input.isGroup,
        name: input.isGroup ? input.name : null,
        created_by: input.creatorId,
      })
      .select()
      .single()
  );

  const memberRows: Pick<ChatMember, "chat_id" | "user_id" | "is_admin">[] = [
    { chat_id: chat.id, user_id: input.creatorId, is_admin: input.isGroup },
    ...input.memberIds
      .filter((id) => id !== input.creatorId)
      .map((id) => ({ chat_id: chat.id, user_id: id, is_admin: false })),
  ];
  await unwrap(supabase.from("chat_members").insert(memberRows));

  return chat;
}

export async function renameGroup(chatId: string, name: string): Promise<void> {
  await unwrap(supabase.from("chats").update({ name }).eq("id", chatId));
}

export async function addMember(chatId: string, userId: string): Promise<void> {
  await unwrap(
    supabase
      .from("chat_members")
      .insert({ chat_id: chatId, user_id: userId, is_admin: false })
  );
}

export async function removeMember(
  chatId: string,
  userId: string
): Promise<void> {
  await unwrap(
    supabase
      .from("chat_members")
      .delete()
      .eq("chat_id", chatId)
      .eq("user_id", userId)
  );
}

export async function setAdmin(
  chatId: string,
  userId: string,
  isAdmin: boolean
): Promise<void> {
  await unwrap(
    supabase
      .from("chat_members")
      .update({ is_admin: isAdmin })
      .eq("chat_id", chatId)
      .eq("user_id", userId)
  );
}

/** Leaves a chat via the `leave_group` RPC (handles admin hand-off + cleanup). */
export async function leaveGroup(chatId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc("leave_group", {
    p_chat_id: chatId,
    p_user_id: userId,
  });
  if (error) throw error;
}
