import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff } from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { unwrap } from "@/shared/lib/supabase-helpers";
import { qk } from "@/shared/lib/queryKeys";
import type { AppNotification } from "@/shared/types/db";

const dayLabel = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

/** Best-effort deep link from the notification payload. */
const notificationHref = (n: AppNotification): string | null => {
  const data = (typeof n.data === "object" && n.data) as Record<string, unknown> | null;
  if (data?.post_id) return "/app/feed";
  if (data?.question_id) return "/app/qa";
  if (data?.chat_id) return "/app/chat";
  if (n.type?.includes("question") || n.type?.includes("answer")) return "/app/qa";
  if (n.type?.includes("post") || n.type?.includes("like") || n.type?.includes("comment")) return "/app/feed";
  if (n.type?.includes("message") || n.type?.includes("chat")) return "/app/chat";
  if (n.type?.includes("follow")) return "/app/followers";
  return null;
};

const NotificationDropdown = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Realtime: invalidate on new notifications for this user
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: qk.notifications.list(user.id) })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: user ? qk.notifications.list(user.id) : ["notifications", "anonymous"],
    enabled: !!user,
    queryFn: async (): Promise<AppNotification[]> =>
      unwrap(
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(30)
      ),
  });

  const unread = notifications.filter((n) => !n.is_read);

  const markRead = useMutation({
    mutationFn: async (ids: string[]) => {
      await unwrap(
        supabase.from("notifications").update({ is_read: true }).in("id", ids).select("id")
      );
    },
    onSuccess: () => {
      if (user) queryClient.invalidateQueries({ queryKey: qk.notifications.list(user.id) });
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unread.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => markRead.mutate(unread.map((n) => n.id))}
              disabled={markRead.isPending}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-4/5" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : unread.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <BellOff className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium">You're all caught up</p>
              <p className="text-xs text-muted-foreground">New notifications will show up here.</p>
            </div>
          ) : (
            Object.entries(
              unread.reduce<Record<string, AppNotification[]>>((groups, n) => {
                const label = n.created_at ? dayLabel(new Date(n.created_at)) : "Earlier";
                (groups[label] ||= []).push(n);
                return groups;
              }, {})
            ).map(([label, items]) => (
              <div key={label}>
                <p className="sticky top-0 bg-popover px-4 pb-1 pt-3 text-xs font-medium text-muted-foreground">
                  {label}
                </p>
                <div className="divide-y">
                  {items.map((notification) => (
                    <button
                      key={notification.id}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
                      onClick={() => {
                        markRead.mutate([notification.id]);
                        const href = notificationHref(notification);
                        if (href) navigate(href);
                      }}
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <span className="flex-1">
                        <span className="block text-sm leading-snug">
                          {typeof notification.data === "object" &&
                          notification.data &&
                          "text" in notification.data
                            ? String((notification.data as { text: string }).text)
                            : notification.type}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {notification.created_at
                            ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
                            : ""}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
