import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { saveAs } from "file-saver";
import { isSameDay } from "date-fns";
import { ArrowLeft, Loader2, MessageCircle, MoreVertical, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/EmptyState";
import { useConfirm } from "@/components/ConfirmDialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatWithDetails } from "../types";
import { fetchAllMessages } from "../api";
import {
  formatDayLabel,
  getChatDisplayName,
  getInitials,
  getOtherMembers,
} from "../lib";
import { useMessages } from "../hooks/useMessages";
import { useSendMessage } from "../hooks/useSendMessage";
import { useChatRealtime } from "../hooks/useChatRealtime";
import { useChatPresence } from "../hooks/useChatPresence";
import { useChatAdmin } from "../hooks/useChatAdmin";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { GroupInfoDialog } from "./GroupInfoDialog";

interface ChatWindowProps {
  chat: ChatWithDetails;
  onlineUserIds: Set<string>;
  onBack: () => void;
  onLeft: () => void;
}

export function ChatWindow({ chat, onlineUserIds, onBack, onLeft }: ChatWindowProps) {
  const { user, profile } = useAuth();
  const confirm = useConfirm();
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);

  const {
    messages,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMessages(chat.id);
  const sendMessage = useSendMessage(chat.id);
  const { typingUsers, sendTyping } = useChatPresence(chat.id);
  const { leaveGroup } = useChatAdmin(chat.id);
  useChatRealtime(chat.id);

  const displayName = getChatDisplayName(chat, user?.id);
  const otherMembers = getOtherMembers(chat, user?.id);
  const peer = otherMembers[0];
  const isPeerOnline = !!peer?.user_id && onlineUserIds.has(peer.user_id);
  const onlineMemberCount = chat.chat_members.filter(
    (m) => !!m.user_id && onlineUserIds.has(m.user_id)
  ).length;
  const typingNames = Object.values(typingUsers);

  // --- Scroll management -------------------------------------------------
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const lastMessage = messages[messages.length - 1];

  const getViewport = () =>
    scrollRootRef.current?.querySelector<HTMLDivElement>(
      "[data-radix-scroll-area-viewport]"
    ) ?? null;

  const loadOlder = useCallback(() => {
    const viewport = getViewport();
    prevScrollHeightRef.current = viewport?.scrollHeight ?? 0;
    fetchNextPage();
  }, [fetchNextPage]);

  // Keep the viewport anchored when older messages are prepended.
  useEffect(() => {
    if (!prevScrollHeightRef.current) return;
    const viewport = getViewport();
    if (viewport) {
      viewport.scrollTop += viewport.scrollHeight - prevScrollHeightRef.current;
    }
    prevScrollHeightRef.current = 0;
  }, [messages.length]);

  // Scroll to the bottom on open and when a new message arrives
  // (own message, or any message while already near the bottom).
  useEffect(() => {
    const viewport = getViewport();
    if (!viewport || !lastMessage) return;
    const nearBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 160;
    if (isLoading || nearBottom || lastMessage.user_id === user?.id) {
      viewport.scrollTop = viewport.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.id, isLoading, lastMessage?.id]);

  // "Load older" when the top sentinel scrolls into view.
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const viewport = getViewport();
    if (!sentinel || !viewport || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) loadOlder();
      },
      { root: viewport }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, loadOlder]);

  // --- Actions -----------------------------------------------------------
  const handleSend = (content: string) => sendMessage.mutate({ content });
  const handleAttach = (file: File) => sendMessage.mutate({ content: "", file });
  const handleTyping = () => sendTyping(profile?.full_name ?? "Someone");

  const handleExport = async () => {
    try {
      const allMessages = await fetchAllMessages(chat.id);
      let text = `Chat: ${displayName}\n`;
      for (const message of allMessages) {
        const name = message.profiles?.full_name ?? "Unknown";
        const time = new Date(message.created_at).toLocaleString();
        text += `[${time}] ${name}: ${message.content ?? ""}${
          message.media_url ? ` [attachment: ${message.media_url}]` : ""
        }\n`;
      }
      saveAs(
        new Blob([text], { type: "text/plain;charset=utf-8" }),
        `${displayName}-chat.txt`
      );
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeave = async () => {
    if (chat.is_group) {
      const admins = chat.chat_members.filter((m) => m.is_admin);
      if (admins.length === 1 && admins[0].user_id === user?.id) {
        toast({
          title: "You are the only admin",
          description: "Assign admin rights to another member before leaving.",
          variant: "destructive",
        });
        setGroupInfoOpen(true);
        return;
      }
    }
    const ok = await confirm({
      title: chat.is_group ? "Leave group?" : "Delete chat?",
      description: chat.is_group
        ? `You will no longer receive messages from "${displayName}".`
        : "This conversation will be removed from your chats.",
      confirmLabel: chat.is_group ? "Leave" : "Delete",
      destructive: true,
    });
    if (!ok) return;
    leaveGroup.mutate(undefined, {
      onSuccess: () => {
        toast({ title: chat.is_group ? "You left the group." : "Chat deleted." });
        onLeft();
      },
    });
  };

  // --- Render ------------------------------------------------------------
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b p-3">
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 md:hidden"
          onClick={onBack}
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            {!chat.is_group && (
              <AvatarImage src={peer?.profiles?.avatar_url ?? undefined} />
            )}
            <AvatarFallback>
              {chat.is_group ? (
                <Users className="h-4 w-4 text-muted-foreground" />
              ) : (
                getInitials(peer?.profiles?.full_name)
              )}
            </AvatarFallback>
          </Avatar>
          {!chat.is_group && isPeerOnline && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success ring-2 ring-background" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{displayName}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {chat.is_group
              ? `${chat.chat_members.length} members${
                  onlineMemberCount > 0 ? ` · ${onlineMemberCount} online` : ""
                }`
              : isPeerOnline
                ? "Online"
                : "Offline"}
          </p>
        </div>

        {chat.is_group && (
          <button
            type="button"
            className="hidden shrink-0 -space-x-2 sm:flex"
            onClick={() => setGroupInfoOpen(true)}
            aria-label="View members"
          >
            {chat.chat_members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-7 w-7 ring-2 ring-background">
                <AvatarImage src={member.profiles?.avatar_url ?? undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(member.profiles?.full_name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {chat.chat_members.length > 4 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-medium ring-2 ring-background">
                +{chat.chat_members.length - 4}
              </span>
            )}
          </button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="shrink-0" aria-label="Chat options">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {chat.is_group && (
              <DropdownMenuItem onClick={() => setGroupInfoOpen(true)}>
                Group Info
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleExport}>
              Export Chat to Text
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLeave}
              className="text-destructive focus:text-destructive"
            >
              {chat.is_group ? "Leave Group" : "Delete Chat"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div ref={scrollRootRef} className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="space-y-3 p-4">
            <div ref={topSentinelRef} aria-hidden="true" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="No messages yet"
                description="Start the conversation by sending a message!"
              />
            ) : (
              messages.map((message, index) => {
                const previous = messages[index - 1];
                const showDaySeparator =
                  !previous ||
                  !isSameDay(
                    new Date(previous.created_at),
                    new Date(message.created_at)
                  );
                return (
                  <Fragment key={message.id}>
                    {showDaySeparator && (
                      <div className="flex justify-center py-1">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                          {formatDayLabel(new Date(message.created_at))}
                        </span>
                      </div>
                    )}
                    <MessageBubble
                      message={message}
                      isOwn={message.user_id === user?.id}
                      showSender={chat.is_group}
                    />
                  </Fragment>
                );
              })
            )}

            {typingNames.length > 0 && (
              <div className="flex animate-fade-in justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-3.5 py-2.5">
                  <span className="text-xs text-muted-foreground">
                    {typingNames.length === 1
                      ? `${typingNames[0]} is typing`
                      : `${typingNames.join(", ")} are typing`}
                  </span>
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t p-3">
        <MessageInput
          onSend={handleSend}
          onAttach={handleAttach}
          onTyping={handleTyping}
          uploading={sendMessage.isPending && !!sendMessage.variables?.file}
        />
      </div>

      {chat.is_group && (
        <GroupInfoDialog
          chat={chat}
          open={groupInfoOpen}
          onOpenChange={setGroupInfoOpen}
          onlineUserIds={onlineUserIds}
        />
      )}
    </Card>
  );
}
