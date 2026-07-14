import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { TablesUpdate } from "@/integrations/supabase/types";
import type { FileModel, Post, Profile } from "@/shared/types/db";

/** Update the caller's profile row and return the fresh row. */
export async function updateProfileRow(
  userId: string,
  update: TablesUpdate<"profiles">
): Promise<Profile> {
  return unwrap(
    supabase.from("profiles").update(update).eq("id", userId).select().single()
  );
}

/**
 * Upload an avatar to the `avatars` bucket under `<userId>/<timestamp>.<ext>`
 * and return its public URL. (Same storage layout as before the refactor.)
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split(".").pop() ?? "png";
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
  return data.publicUrl;
}

export type FileMetadata = Pick<
  FileModel,
  "id" | "file_name" | "file_size" | "file_type" | "file_url" | "description" | "is_public" | "created_at"
>;

export interface AccountExport {
  exported_at: string;
  profile: Profile;
  posts: Post[];
  files: FileMetadata[];
}

/** Gather the caller's profile, posts and file metadata for a data export. */
export async function fetchAccountExport(userId: string): Promise<AccountExport> {
  const [profile, posts, files] = await Promise.all([
    unwrap<Profile>(
      supabase.from("profiles").select("*").eq("id", userId).single()
    ),
    unwrap<Post[]>(
      supabase
        .from("posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    ),
    unwrap<FileMetadata[]>(
      supabase
        .from("filemodels")
        .select(
          "id, file_name, file_size, file_type, file_url, description, is_public, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
    ),
  ]);

  return { exported_at: new Date().toISOString(), profile, posts, files };
}

/** Trigger a client-side download of `data` as a pretty-printed JSON file. */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
