import type {
  Chat,
  ChatMember,
  ChatMessage,
  Profile,
  ProfileLite,
} from "@/shared/types/db";

/** A chat member row joined with its profile. */
export type ChatMemberWithProfile = ChatMember & {
  profiles: ProfileLite | null;
};

/** Preview of the most recent message in a chat (for the list column). */
export type LastMessagePreview = Pick<
  ChatMessage,
  "chat_id" | "content" | "created_at" | "user_id" | "media_url"
>;

/** A chat with its members (incl. profiles) and last-message preview. */
export type ChatWithDetails = Chat & {
  chat_members: ChatMemberWithProfile[];
  last_message: LastMessagePreview | null;
};

/** Profile shape used by user pickers (create chat / add member). */
export type ProfileOption = Pick<
  Profile,
  "id" | "full_name" | "avatar_url" | "email"
>;
