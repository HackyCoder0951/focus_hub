import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { Profile } from "@/shared/types/db";

export type AlumniDirectoryEntry = Pick<
  Profile,
  "id" | "full_name" | "avatar_url" | "bio" | "graduation_year" | "company" | "designation"
>;

export interface AlumniDirectoryFilters {
  search?: string;
  graduationYear?: number;
}

const ALUMNI_DIRECTORY_SELECT =
  "id, full_name, avatar_url, bio, graduation_year, company, designation";

export async function fetchAlumniDirectory(
  filters: AlumniDirectoryFilters = {}
): Promise<AlumniDirectoryEntry[]> {
  let query = supabase
    .from("profiles")
    .select(ALUMNI_DIRECTORY_SELECT)
    .eq("member_type", "alumni")
    .order("full_name", { ascending: true });

  if (filters.search) {
    const term = filters.search.trim();
    if (term) {
      query = query.or(`full_name.ilike.%${term}%,company.ilike.%${term}%`);
    }
  }
  if (filters.graduationYear) {
    query = query.eq("graduation_year", filters.graduationYear);
  }

  return (await unwrap(query)) ?? [];
}
