import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { Profile } from "@/shared/types/db";

export type UserStatus = "active" | "banned" | "inactive";

/** Profile fields the admin user table needs, with status defaulted. */
export type AdminUser = Pick<
  Profile,
  "id" | "full_name" | "email" | "avatar_url" | "created_at"
> & {
  status: string;
};

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const rows = await unwrap(
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, created_at, status")
      .order("created_at", { ascending: false })
  );
  return (rows ?? []).map((row) => ({
    ...row,
    status: row.status ?? "active",
  }));
}

export async function updateUserStatus(id: string, status: UserStatus): Promise<void> {
  const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
  if (error) throw error;
}

/**
 * Deletes the user's profile row. NOTE: this does NOT delete the Supabase
 * auth account — true server-side deletion needs a service-role endpoint.
 */
export async function removeUserProfile(id: string): Promise<void> {
  const { error } = await supabase.from("profiles").delete().eq("id", id);
  if (error) throw error;
}
