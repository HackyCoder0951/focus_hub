import { useQuery } from "@tanstack/react-query";
import { qk } from "@/shared/lib/queryKeys";
import { fetchRecentActivity } from "../api/activity";

export function useRecentActivity() {
  return useQuery({
    queryKey: qk.admin.activity,
    queryFn: fetchRecentActivity,
  });
}
