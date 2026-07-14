import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { qk } from "@/shared/lib/queryKeys";
import { toast } from "@/hooks/use-toast";
import * as api from "../api";

/**
 * Group-management mutations for a chat: rename, add/remove member,
 * toggle admin, and leave (via the `leave_group` RPC, which hands off
 * admin and cleans up empty chats server-side).
 */
export function useChatAdmin(chatId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: qk.chat.list });

  const onError = (title: string) => (error: Error) =>
    toast({ title, description: error.message, variant: "destructive" });

  const renameGroup = useMutation({
    mutationFn: (name: string) => api.renameGroup(chatId!, name.trim()),
    onSuccess: () => {
      invalidateList();
      toast({ title: "Group name updated" });
    },
    onError: onError("Error updating group name"),
  });

  const addMember = useMutation({
    mutationFn: (userId: string) => api.addMember(chatId!, userId),
    onSuccess: () => {
      invalidateList();
      toast({ title: "Member added" });
    },
    onError: onError("Error adding member"),
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => api.removeMember(chatId!, userId),
    onSuccess: () => {
      invalidateList();
      toast({ title: "Member removed" });
    },
    onError: onError("Error removing member"),
  });

  const toggleAdmin = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      api.setAdmin(chatId!, userId, isAdmin),
    onSuccess: (_data, { isAdmin }) => {
      invalidateList();
      toast({ title: isAdmin ? "Admin assigned" : "Admin removed" });
    },
    onError: onError("Error updating admin status"),
  });

  const leaveGroup = useMutation({
    mutationFn: () => api.leaveGroup(chatId!, user!.id),
    onSuccess: () => {
      invalidateList();
    },
    onError: onError("Error leaving chat"),
  });

  return { renameGroup, addMember, removeMember, toggleAdmin, leaveGroup };
}
