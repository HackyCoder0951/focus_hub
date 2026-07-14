import { supabase } from "@/integrations/supabase/client";
import { unwrap } from "@/shared/lib/supabase-helpers";
import type { FileModel } from "@/shared/types/db";
import type { FileWithProfile } from "../lib/file-utils";

const BUCKET = "uploads";

export async function fetchFiles(): Promise<FileWithProfile[]> {
  const data = await unwrap(
    supabase
      .from("filemodels")
      .select("*, profiles: user_id (full_name, avatar_url)")
      .order("created_at", { ascending: false })
  );
  return (data ?? []) as unknown as FileWithProfile[];
}

export interface UploadFileInput {
  file: File;
  description: string;
  isPublic: boolean;
  userId: string;
}

/** Uploads the blob to the storage bucket then inserts the filemodels row. */
export async function uploadFile({ file, description, isPublic, userId }: UploadFileInput): Promise<void> {
  const fileExt = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  await unwrap(
    supabase.from("filemodels").insert({
      user_id: userId,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      description: description.trim() || null,
      is_public: isPublic,
    })
  );
}

/** Removes the storage object (best-effort) and deletes the filemodels row. */
export async function deleteFile(file: FileModel): Promise<void> {
  // Derive the storage path from the public URL; a DB trigger also cleans up,
  // so a storage failure here should not block the row deletion.
  const marker = `/object/public/${BUCKET}/`;
  const idx = file.file_url.indexOf(marker);
  if (idx !== -1) {
    const path = decodeURIComponent(file.file_url.slice(idx + marker.length));
    await supabase.storage.from(BUCKET).remove([path]);
  }

  await unwrap(supabase.from("filemodels").delete().eq("id", file.id));
}

export interface FileMetaInput {
  description: string;
  isPublic: boolean;
}

export async function updateFileMeta(id: string, meta: FileMetaInput): Promise<void> {
  await unwrap(
    supabase
      .from("filemodels")
      .update({
        description: meta.description.trim() || null,
        is_public: meta.isPublic,
      })
      .eq("id", id)
  );
}
