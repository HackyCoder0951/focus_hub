import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/shared/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import type { MentorshipConnection } from "@/shared/types/db";
import {
  fetchIncomingMentorshipRequests,
  fetchSentMentorshipRequests,
  requestMentorship,
  respondToMentorship,
  type MentorshipResponseAction,
} from "../api/mentorship";

export function useSentMentorshipRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.mentorship.sent(user?.id ?? ""),
    queryFn: () => fetchSentMentorshipRequests(user!.id),
    enabled: !!user,
  });
}

export function useIncomingMentorshipRequests(
  status: "pending" | "accepted" | "declined" | "all" = "pending"
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.mentorship.incoming(user?.id ?? "", status),
    queryFn: () => fetchIncomingMentorshipRequests(user!.id, status),
    enabled: !!user,
  });
}

export function useSendMentorshipRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { alumniId: string; message: string | null }) => {
      if (!user) throw new Error("You must be signed in");
      return requestMentorship({ studentId: user.id, ...input });
    },
    onSuccess: () => {
      if (user) {
        void queryClient.invalidateQueries({ queryKey: qk.mentorship.sent(user.id) });
      }
      toast.success("Mentorship request sent");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Failed to send request");
    },
  });
}

export function useRespondToMentorship() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      connection,
      action,
    }: {
      connection: MentorshipConnection;
      action: MentorshipResponseAction;
    }) => respondToMentorship(connection, action),
    onSuccess: (_data, { action }) => {
      if (user) {
        void queryClient.invalidateQueries({
          queryKey: qk.mentorship.incoming(user.id).slice(0, 3),
        });
      }
      void queryClient.invalidateQueries({ queryKey: qk.chat.list });
      toast.success(action === "accept" ? "Mentorship accepted" : "Request declined");
    },
    onError: () => {
      toast.error("Failed to update request");
    },
  });
}
