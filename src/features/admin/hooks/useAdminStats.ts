import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import { fetchAdminStats } from "../api/stats";

export function useAdminStats() {
  return useQuery({
    queryKey: qk.admin.stats,
    queryFn: fetchAdminStats,
  });
}
