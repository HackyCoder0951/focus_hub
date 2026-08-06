import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import { createChat } from "@/features/chat/api";
import type { MentorshipConnection, Profile } from "@/shared/types/db";

type ConnectionProfile = Pick<Profile, "id" | "full_name" | "avatar_url" | "email">;

export interface MentorshipConnectionWithProfiles {
  connection: MentorshipConnection;
  student: ConnectionProfile | null;
  alumnus: ConnectionProfile | null;
}

const PROFILE_COLS = "id, full_name, avatar_url, email";

async function withProfiles(
  connections: MentorshipConnection[]
): Promise<MentorshipConnectionWithProfiles[]> {
  if (connections.length === 0) return [];
  const userIds = [
    ...new Set(connections.flatMap((c) => [c.student_id, c.alumni_id])),
  ];
  const profiles: ConnectionProfile[] =
    (await unwrap(supabase.from("profiles").select(PROFILE_COLS).in("id", userIds))) ?? [];
  const byId = new Map(profiles.map((p) => [p.id, p]));

  return connections.map((connection) => ({
    connection,
    student: byId.get(connection.student_id) ?? null,
    alumnus: byId.get(connection.alumni_id) ?? null,
  }));
}

/** Requests sent by the current student, most recent first. */
export async function fetchSentMentorshipRequests(
  studentId: string
): Promise<MentorshipConnectionWithProfiles[]> {
  const rows: MentorshipConnection[] =
    (await unwrap(
      supabase
        .from("mentorship_connections")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
    )) ?? [];
  return withProfiles(rows);
}

/** Requests received by the current alumnus, most recent first. */
export async function fetchIncomingMentorshipRequests(
  alumniId: string,
  status: "pending" | "accepted" | "declined" | "all" = "pending"
): Promise<MentorshipConnectionWithProfiles[]> {
  let query = supabase
    .from("mentorship_connections")
    .select("*")
    .eq("alumni_id", alumniId)
    .order("created_at", { ascending: false });
  if (status !== "all") {
    query = query.eq("status", status);
  }
  const rows: MentorshipConnection[] = (await unwrap(query)) ?? [];
  return withProfiles(rows);
}

export async function requestMentorship(input: {
  studentId: string;
  alumniId: string;
  message: string | null;
}): Promise<MentorshipConnection> {
  return unwrap(
    supabase
      .from("mentorship_connections")
      .insert({
        student_id: input.studentId,
        alumni_id: input.alumniId,
        message: input.message,
        status: "pending",
      })
      .select("*")
      .single()
  );
}

export type MentorshipResponseAction = "accept" | "decline";

/**
 * Responds to a request:
 * - "accept"  → creates a 1:1 chat between student and alumnus, links it to
 *   the connection, and marks it accepted.
 * - "decline" → marks it declined only.
 */
export async function respondToMentorship(
  connection: MentorshipConnection,
  action: MentorshipResponseAction
): Promise<void> {
  let chatId: string | null = null;
  if (action === "accept") {
    const chat = await createChat({
      creatorId: connection.alumni_id,
      memberIds: [connection.student_id, connection.alumni_id],
      isGroup: false,
      name: null,
    });
    chatId = chat.id;
  }

  const { error } = await supabase
    .from("mentorship_connections")
    .update({
      status: action === "accept" ? "accepted" : "declined",
      chat_id: chatId,
      responded_at: new Date().toISOString(),
    })
    .eq("id", connection.id);
  if (error) throw error;
}
