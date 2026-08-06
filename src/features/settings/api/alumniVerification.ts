import { supabase } from "@/integrations/supabase/client";
import { unwrap, unwrapMaybe } from "@/shared/lib/supabase-helpers";
import type { AlumniVerificationRequest, Profile } from "@/shared/types/db";
import { PROFILE_SELECT } from "@/features/profile/api/profile";

/** The caller's most recent alumni verification request, if any. */
export async function fetchMyAlumniRequest(
  userId: string
): Promise<AlumniVerificationRequest | null> {
  return unwrapMaybe<AlumniVerificationRequest>(
    supabase
      .from("alumni_verification_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  );
}

export interface SubmitAlumniRequestInput {
  userId: string;
  graduation_year: number | null;
  company: string | null;
  designation: string | null;
}

export async function submitAlumniRequest(
  input: SubmitAlumniRequestInput
): Promise<AlumniVerificationRequest> {
  return unwrap(
    supabase
      .from("alumni_verification_requests")
      .insert({
        user_id: input.userId,
        graduation_year: input.graduation_year,
        company: input.company,
        designation: input.designation,
        status: "pending",
      })
      .select("*")
      .single()
  );
}

/** Self-service downgrade back to student — no verification required. */
export async function revertToStudent(userId: string): Promise<Profile> {
  return unwrap(
    supabase
      .from("profiles")
      .update({ member_type: "student" })
      .eq("id", userId)
      .select(PROFILE_SELECT)
      .single()
  );
}
