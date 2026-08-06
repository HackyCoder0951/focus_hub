import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { qk } from "@/shared/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  fetchMyAlumniRequest,
  revertToStudent,
  submitAlumniRequest,
  type SubmitAlumniRequestInput,
} from "../api/alumniVerification";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function useMyAlumniRequest() {
  const { user } = useAuth();

  return useQuery({
    queryKey: qk.profile.alumniRequest(user?.id ?? ""),
    queryFn: () => fetchMyAlumniRequest(user!.id),
    enabled: !!user,
  });
}

export function useSubmitAlumniRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<SubmitAlumniRequestInput, "userId">) => {
      if (!user) throw new Error("You must be signed in");
      return submitAlumniRequest({ ...input, userId: user.id });
    },
    onSuccess: () => {
      if (user) {
        void queryClient.invalidateQueries({ queryKey: qk.profile.alumniRequest(user.id) });
      }
      toast({
        title: "Verification request submitted",
        description: "An admin will review your request to become alumni.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit request",
        description: errorMessage(error),
        variant: "destructive",
      });
    },
  });
}

export function useRevertToStudent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error("You must be signed in");
      return revertToStudent(user.id);
    },
    onSuccess: (row) => {
      if (user) {
        queryClient.setQueryData(qk.profile.detail(user.id), row);
        void queryClient.invalidateQueries({ queryKey: qk.profile.detail(user.id) });
      }
      void supabase.auth.refreshSession();
      toast({ title: "Reverted to student", description: "Your member type has been updated." });
    },
    onError: (error) => {
      toast({
        title: "Failed to update member type",
        description: errorMessage(error),
        variant: "destructive",
      });
    },
  });
}
