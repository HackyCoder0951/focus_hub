import { format, isToday, isYesterday } from "date-fns";
import type { ProfileLite } from "@/shared/types/db";
import type { ChatWithDetails, LastMessagePreview } from "./types";

export const ONLINE_STALE_MS = 90_000;

/** Display name for a chat: group name, or the other member's name in a 1:1. */
export function getChatDisplayName(
  chat: ChatWithDetails,
  currentUserId?: string
): string {
  if (chat.is_group && chat.name) return chat.name;
  const other = chat.chat_members.find((m) => m.user_id !== currentUserId);
  return other?.profiles?.full_name || "Unknown User";
}

/** Members of a chat other than the current user. */
export function getOtherMembers(chat: ChatWithDetails, currentUserId?: string) {
  return chat.chat_members.filter((m) => m.user_id !== currentUserId);
}

/** "AB" style initials from a full name. */
export function getInitials(name?: string | null): string {
  return (name ?? "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Compact timestamp for chat-list rows and message bubbles. */
export function formatListTime(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return format(date, "p");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "dd/MM/yyyy");
}

/** Label for the date-separator chip between message days. */
export function formatDayLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

/** One-line preview text for the chat list. */
export function getLastMessagePreview(
  lastMessage: LastMessagePreview | null,
  currentUserId?: string
): string | null {
  if (!lastMessage) return null;
  const prefix = lastMessage.user_id === currentUserId ? "You: " : "";
  if (lastMessage.media_url && !lastMessage.content) {
    return `${prefix}Sent an attachment`;
  }
  return `${prefix}${lastMessage.content ?? ""}`;
}

export function isUserOnline(
  profile: Pick<ProfileLite, "id" | "last_seen"> | null | undefined,
  realtimeOnlineIds: Set<string>,
  now = Date.now()
): boolean {
  if (!profile?.id) return false;
  if (realtimeOnlineIds.has(profile.id)) return true;
  if (!profile.last_seen) return false;
  return now - new Date(profile.last_seen).getTime() < ONLINE_STALE_MS;
}

/** Whether a media URL points at an inline-renderable image. */
export function isImageUrl(url: string): boolean {
  return /\.(jpeg|jpg|png|gif|webp)$/i.test(url);
}

/** File name from a storage public URL. */
export function getFileName(url: string): string {
  try {
    return decodeURIComponent(url.split("/").pop() || "file");
  } catch {
    return "file";
  }
}
