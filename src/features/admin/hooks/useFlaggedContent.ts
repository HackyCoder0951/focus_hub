import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/shared/lib/queryKeys";
import type { ContentFlag } from "@/shared/types/db";
import { fetchFlags, resolveFlag, type FlagAction, type FlagStatusFilter } from "../api/flags";

export function useFlaggedContent(status: FlagStatusFilter = "all") {
  return useQuery({
    queryKey: qk.admin.flags(status),
    queryFn: () => fetchFlags(status),
  });
}

/** Prefix that matches every qk.admin.flags(status) key. */
const FLAGS_PREFIX = qk.admin.flags("all").slice(0, 2);

export function useResolveFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ flag, action }: { flag: ContentFlag; action: FlagAction }) =>
      resolveFlag(flag, action),
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: FLAGS_PREFIX });
      queryClient.invalidateQueries({ queryKey: qk.admin.activity });
      toast.success(action === "remove" ? "Content removed and flag resolved" : "Flag dismissed");
    },
    onError: () => {
      toast.error("Failed to update flag");
    },
  });
}
