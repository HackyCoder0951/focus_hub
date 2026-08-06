import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/shared/lib/queryKeys";
import {
  fetchAdminUsers,
  removeUserProfile,
  updateUserStatus,
  type UserStatus,
} from "../api/users";

export function useAdminUsers(memberType?: string) {
  return useQuery({
    queryKey: qk.admin.users(memberType),
    queryFn: () => fetchAdminUsers(memberType),
  });
}

/** Prefix that matches every qk.admin.users(memberType) key. */
const USERS_PREFIX = qk.admin.users().slice(0, 2);

const STATUS_LABEL: Record<UserStatus, string> = {
  active: "activated",
  banned: "banned",
  inactive: "deactivated",
};

export function useUserStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      updateUserStatus(id, status),
    onSuccess: (_data, { status }) => {
      queryClient.invalidateQueries({ queryKey: USERS_PREFIX });
      toast.success(`User ${STATUS_LABEL[status]}`);
    },
    onError: () => {
      toast.error("Failed to update user status");
    },
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeUserProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_PREFIX });
      queryClient.invalidateQueries({ queryKey: qk.admin.stats });
      toast.success("Profile removed");
    },
    onError: () => {
      toast.error("Failed to remove profile");
    },
  });
}
