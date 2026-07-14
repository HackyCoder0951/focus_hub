import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { qk } from "@/shared/lib/queryKeys";
import { fetchChats } from "../api";

/**
 * All chats for the current user, with members + last-message preview,
 * sorted by last activity. One nested select + one batched
 * last-message query (replaces the old per-chat N+1 pattern).
 */
export function useChats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: qk.chat.list,
    queryFn: () => fetchChats(user!.id),
    enabled: !!user,
  });
}
