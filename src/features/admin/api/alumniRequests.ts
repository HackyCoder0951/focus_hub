import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { AlumniVerificationRequest, Profile } from "@/shared/types/db";

export type AlumniRequestStatusFilter = "pending" | "approved" | "rejected" | "all";

type RequesterProfile = Pick<Profile, "id" | "full_name" | "email">;

export interface AlumniRequestWithRequester {
  request: AlumniVerificationRequest;
  requester: RequesterProfile | null;
}

export async function fetchAlumniRequests(
  status: AlumniRequestStatusFilter
): Promise<AlumniRequestWithRequester[]> {
  let query = supabase
    .from("alumni_verification_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const requests: AlumniVerificationRequest[] = (await unwrap(query)) ?? [];
  if (requests.length === 0) return [];

  const userIds = [...new Set(requests.map((r) => r.user_id))];
  const requesters: RequesterProfile[] =
    (await unwrap(
      supabase.from("profiles").select("id, full_name, email").in("id", userIds)
    )) ?? [];
  const requesterById = new Map(requesters.map((r) => [r.id, r]));

  return requests.map((request) => ({
    request,
    requester: requesterById.get(request.user_id) ?? null,
  }));
}

export type AlumniRequestAction = "approve" | "reject";

/**
 * Reviews a request:
 * - "approve" → flips the requester's profile to alumni (copying the
 *   requested graduation year/company/designation) and marks the request approved.
 * - "reject"  → marks the request rejected only, profile is left untouched.
 */
export async function reviewAlumniRequest(
  request: AlumniVerificationRequest,
  action: AlumniRequestAction,
  reviewedBy: string
): Promise<void> {
  if (action === "approve") {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        member_type: "alumni",
        graduation_year: request.graduation_year,
        company: request.company,
        designation: request.designation,
      })
      .eq("id", request.user_id);
    if (profileError) throw profileError;
  }

  const { error } = await supabase
    .from("alumni_verification_requests")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", request.id);
  if (error) throw error;
}
