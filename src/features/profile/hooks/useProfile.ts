import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import {
  fetchProfile,
  fetchProfileActivity,
  fetchProfileRole,
  fetchQaStats,
  fetchUserFiles,
  fetchUserPosts,
} from "../api/profile";

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: qk.profile.detail(userId ?? ""),
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
}

/** Role lookup; missing rows resolve to null instead of erroring. */
export function useProfileRole(userId?: string) {
  return useQuery({
    queryKey: qk.profile.role(userId ?? ""),
    queryFn: () => fetchProfileRole(userId!),
    enabled: !!userId,
  });
}

export function useUserPosts(userId?: string) {
  return useQuery({
    queryKey: qk.profile.posts(userId ?? ""),
    queryFn: () => fetchUserPosts(userId!),
    enabled: !!userId,
  });
}

export function useUserFiles(userId?: string) {
  return useQuery({
    queryKey: qk.profile.files(userId ?? ""),
    queryFn: () => fetchUserFiles(userId!),
    enabled: !!userId,
  });
}

/** Merged recent posts / questions / answers / files timeline. */
export function useProfileActivity(userId?: string) {
  return useQuery({
    queryKey: qk.profile.activity(userId ?? ""),
    queryFn: () => fetchProfileActivity(userId!),
    enabled: !!userId,
  });
}

export function useQaStats(userId?: string) {
  return useQuery({
    queryKey: [...qk.profile.detail(userId ?? ""), "qa-stats"],
    queryFn: () => fetchQaStats(userId!),
    enabled: !!userId,
  });
}
