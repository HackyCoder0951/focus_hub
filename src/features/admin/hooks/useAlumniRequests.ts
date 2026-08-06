import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/shared/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import type { AlumniVerificationRequest } from "@/shared/types/db";
import {
  fetchAlumniRequests,
  reviewAlumniRequest,
  type AlumniRequestAction,
  type AlumniRequestStatusFilter,
} from "../api/alumniRequests";

export function useAlumniRequests(status: AlumniRequestStatusFilter = "all") {
  return useQuery({
    queryKey: qk.admin.alumniRequests(status),
    queryFn: () => fetchAlumniRequests(status),
  });
}

/** Prefix that matches every qk.admin.alumniRequests(status) key. */
const ALUMNI_REQUESTS_PREFIX = qk.admin.alumniRequests("all").slice(0, 2);

export function useReviewAlumniRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      request,
      action,
    }: {
      request: AlumniVerificationRequest;
      action: AlumniRequestAction;
    }) => {
      if (!user) throw new Error("You must be signed in");
      return reviewAlumniRequest(request, action, user.id);
    },
    onSuccess: (_data, { action }) => {
      queryClient.invalidateQueries({ queryKey: ALUMNI_REQUESTS_PREFIX });
      queryClient.invalidateQueries({ queryKey: qk.admin.users().slice(0, 2) });
      queryClient.invalidateQueries({ queryKey: qk.admin.activity });
      toast.success(action === "approve" ? "Alumni request approved" : "Alumni request rejected");
    },
    onError: () => {
      toast.error("Failed to update alumni request");
    },
  });
}
