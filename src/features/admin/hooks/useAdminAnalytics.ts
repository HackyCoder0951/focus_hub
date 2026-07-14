import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import { fetchAdminAnalytics } from "../api/stats";

export function useAdminAnalytics() {
  return useQuery({
    queryKey: qk.admin.analytics,
    queryFn: fetchAdminAnalytics,
  });
}
