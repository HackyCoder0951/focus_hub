import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import { ChatList, ChatWindow, useChats, useChatListRealtime, useOnlineUsers } from "@/features/chat";

const Chat = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { data: chats = [], isLoading } = useChats();
  const onlineUserIds = useOnlineUsers();
  useChatListRealtime();

  const currentChat = chats.find((chat) => chat.id === selectedChatId) ?? null;

  // Clear the selection if the chat disappears (e.g. after leaving it).
  useEffect(() => {
    if (selectedChatId && !isLoading && !chats.some((c) => c.id === selectedChatId)) {
      setSelectedChatId(null);
    }
  }, [chats, isLoading, selectedChatId]);

  return (
    <div className="mx-auto h-[calc(100vh-theme(spacing.14)-4rem)] max-w-7xl animate-fade-in">
      <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
        {/* List column — hidden on mobile while a chat is open */}
        <div className={cn("h-full min-h-0", selectedChatId && "hidden md:block")}>
          <ChatList
            chats={chats}
            isLoading={isLoading}
            selectedChatId={selectedChatId}
            onSelect={setSelectedChatId}
            onlineUserIds={onlineUserIds}
          />
        </div>

        {/* Window column — hidden on mobile until a chat is open */}
        <div className={cn("h-full min-h-0", !selectedChatId && "hidden md:block")}>
          {currentChat ? (
            <ChatWindow
              key={currentChat.id}
              chat={currentChat}
              onlineUserIds={onlineUserIds}
              onBack={() => setSelectedChatId(null)}
              onLeft={() => setSelectedChatId(null)}
            />
          ) : (
            <Card className="flex h-full items-center justify-center">
              <EmptyState
                icon={MessageCircle}
                title="Select a conversation"
                description="Choose a conversation from the list to start messaging"
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
