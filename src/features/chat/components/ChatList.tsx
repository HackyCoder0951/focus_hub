import { useMemo, useState } from "react";
import { MessageCircle, Search, Users } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/EmptyState";
import { ChatListSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatWithDetails } from "../types";
import {
  formatListTime,
  getChatDisplayName,
  getInitials,
  getLastMessagePreview,
  getOtherMembers,
  isUserOnline,
} from "../lib";
import { CreateChatDialog } from "./CreateChatDialog";

interface ChatListProps {
  chats: ChatWithDetails[];
  isLoading: boolean;
  selectedChatId: string | null;
  onSelect: (chatId: string) => void;
  onlineUserIds: Set<string>;
}

export function ChatList({
  chats,
  isLoading,
  selectedChatId,
  onSelect,
  onlineUserIds,
}: ChatListProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return chats;
    return chats.filter((chat) => {
      const memberNames = getOtherMembers(chat, user?.id)
        .map((m) => m.profiles?.full_name ?? "")
        .join(" ");
      return (
        memberNames.toLowerCase().includes(query) ||
        (chat.name ?? "").toLowerCase().includes(query) ||
        (chat.last_message?.content ?? "").toLowerCase().includes(query)
      );
    });
  }, [chats, searchQuery, user?.id]);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="shrink-0 space-y-3 border-b p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Messages</CardTitle>
          <CreateChatDialog onChatCreated={onSelect} />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <ChatListSkeleton rows={6} />
        ) : filteredChats.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title={searchQuery ? "No conversations found" : "No conversations yet"}
            description={
              searchQuery
                ? "Try a different search."
                : "Start a new conversation with the + button."
            }
          />
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === selectedChatId}
                currentUserId={user?.id}
                onlineUserIds={onlineUserIds}
                onSelect={() => onSelect(chat.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}

interface ChatListItemProps {
  chat: ChatWithDetails;
  isActive: boolean;
  currentUserId?: string;
  onlineUserIds: Set<string>;
  onSelect: () => void;
}

function ChatListItem({
  chat,
  isActive,
  currentUserId,
  onlineUserIds,
  onSelect,
}: ChatListItemProps) {
  const displayName = getChatDisplayName(chat, currentUserId);
  const otherMember = getOtherMembers(chat, currentUserId)[0];
  const isOtherOnline =
    !chat.is_group &&
    isUserOnline(otherMember?.profiles, onlineUserIds);
  const preview = getLastMessagePreview(chat.last_message, currentUserId);

  return (
    <button
      type="button"
      data-cy="chat-list-item"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
        isActive ? "bg-accent" : "hover:bg-accent/50"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          {!chat.is_group && (
            <AvatarImage src={otherMember?.profiles?.avatar_url ?? undefined} />
          )}
          <AvatarFallback className="text-xs">
            {chat.is_group ? (
              <Users className="h-4 w-4 text-muted-foreground" />
            ) : (
              getInitials(otherMember?.profiles?.full_name)
            )}
          </AvatarFallback>
        </Avatar>
        {isOtherOnline && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate text-sm font-semibold">{displayName}</h4>
          {chat.last_message && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatListTime(chat.last_message.created_at)}
            </span>
          )}
        </div>
        {preview ? (
          <p className="truncate text-sm text-muted-foreground">{preview}</p>
        ) : (
          <p className="truncate text-sm italic text-muted-foreground">
            No messages yet
          </p>
        )}
      </div>
    </button>
  );
}
