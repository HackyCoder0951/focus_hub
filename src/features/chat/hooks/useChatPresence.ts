import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TYPING_THROTTLE_MS = 2000;
const TYPING_IDLE_MS = 3000;

/**
 * Global presence channel: which users currently have the app's chat
 * page open. Drives the online dots in the chat list and headers.
 * (Replaces the old `profiles.last_seen` polling.)
 */
export function useOnlineUsers(): Set<string> {
  const { user } = useAuth();
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel("chat-online-users", {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        setOnlineIds(new Set(Object.keys(channel.presenceState())));
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return onlineIds;
}

export interface ChatPresence {
  /** Members currently present in this chat's channel. */
  presentMemberIds: Set<string>;
  /** userId -> display name of members typing right now (self excluded). */
  typingUsers: Record<string, string>;
  /** Broadcast a typing event (throttled to one per 2s). */
  sendTyping: (displayName: string) => void;
}

/**
 * Per-chat Supabase Realtime Presence channel: tracks who is present
 * in the chat and relays `typing` broadcasts. Typing is pure realtime
 * — nothing is written to the database (replaces the old
 * `chat_members.typing` write-per-keystroke).
 */
export function useChatPresence(chatId: string | null): ChatPresence {
  const { user } = useAuth();
  const [presentMemberIds, setPresentMemberIds] = useState<Set<string>>(
    new Set()
  );
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastTypingSentRef = useRef(0);
  const typingTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setPresentMemberIds(new Set());
    setTypingUsers({});
    lastTypingSentRef.current = 0;
    if (!chatId || !user) return;

    const timers = typingTimersRef.current;
    const channel = supabase.channel(`chat-presence-${chatId}`, {
      config: { presence: { key: user.id } },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        setPresentMemberIds(new Set(Object.keys(channel.presenceState())));
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const { userId, name } = payload as { userId: string; name: string };
        if (!userId || userId === user.id) return;
        setTypingUsers((prev) => ({ ...prev, [userId]: name }));
        window.clearTimeout(timers[userId]);
        timers[userId] = window.setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[userId];
            return next;
          });
        }, TYPING_IDLE_MS);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      Object.values(timers).forEach((t) => window.clearTimeout(t));
      typingTimersRef.current = {};
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [chatId, user]);

  const sendTyping = useCallback(
    (displayName: string) => {
      if (!user || !channelRef.current) return;
      const now = Date.now();
      if (now - lastTypingSentRef.current < TYPING_THROTTLE_MS) return;
      lastTypingSentRef.current = now;
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: user.id, name: displayName },
      });
    },
    [user]
  );

  return { presentMemberIds, typingUsers, sendTyping };
}
