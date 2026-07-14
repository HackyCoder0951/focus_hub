import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { qk } from "@/shared/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import type { FileModel } from "@/shared/types/db";
import { deleteFile, fetchFiles, updateFileMeta, uploadFile, type FileMetaInput, type UploadFileInput } from "../api/files";
import { getFileKind, type FileWithProfile } from "../lib/file-utils";

export type FileScope = "all" | "mine" | "public";
export type FileTypeFilter = "all" | "image" | "video" | "pdf" | "office" | "text" | "other";
export type FileVisibilityFilter = "all" | "public" | "private";
export type FileSortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "size-desc" | "size-asc";

export interface FileFiltersState {
  search: string;
  type: FileTypeFilter;
  visibility: FileVisibilityFilter;
  sort: FileSortOption;
}

export const DEFAULT_FILE_FILTERS: FileFiltersState = {
  search: "",
  type: "all",
  visibility: "all",
  sort: "newest",
};

function matchesType(file: FileWithProfile, filter: FileTypeFilter): boolean {
  if (filter === "all") return true;
  const kind = getFileKind(file.file_type, file.file_name);
  switch (filter) {
    case "image":
      return kind === "image";
    case "video":
      return kind === "video";
    case "pdf":
      return kind === "pdf";
    case "office":
      return kind === "doc" || kind === "sheet" || kind === "slides";
    case "text":
      return kind === "text" || kind === "code";
    case "other":
      return !["image", "video", "pdf", "doc", "sheet", "slides", "text", "code"].includes(kind);
    default:
      return true;
  }
}

function sortFiles(a: FileWithProfile, b: FileWithProfile, sort: FileSortOption): number {
  switch (sort) {
    case "newest":
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    case "oldest":
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    case "name-asc":
      return a.file_name.localeCompare(b.file_name);
    case "name-desc":
      return b.file_name.localeCompare(a.file_name);
    case "size-desc":
      return (b.file_size ?? 0) - (a.file_size ?? 0);
    case "size-asc":
      return (a.file_size ?? 0) - (b.file_size ?? 0);
    default:
      return 0;
  }
}

/**
 * Single query over filemodels with typed client-side scope/search/type/
 * visibility filtering and sorting.
 */
export function useFiles(filters: FileFiltersState, scope: FileScope = "all") {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: qk.files.list(),
    queryFn: fetchFiles,
  });

  const files = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (query.data ?? [])
      .filter((file) => {
        if (scope === "mine" && (!user || file.user_id !== user.id)) return false;
        if (scope === "public" && !file.is_public) return false;
        if (search) {
          const inName = file.file_name.toLowerCase().includes(search);
          const inDescription = file.description?.toLowerCase().includes(search) ?? false;
          if (!inName && !inDescription) return false;
        }
        if (!matchesType(file, filters.type)) return false;
        if (filters.visibility === "public" && file.is_public !== true) return false;
        if (filters.visibility === "private" && file.is_public !== false) return false;
        return true;
      })
      .sort((a, b) => sortFiles(a, b, filters.sort));
  }, [query.data, filters.search, filters.type, filters.visibility, filters.sort, scope, user]);

  return { ...query, files };
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadFileInput) => uploadFile(input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: qk.files.all });
      queryClient.invalidateQueries({ queryKey: qk.profile.files(input.userId) });
    },
  });
}

/** Deletion mutation — pair with `useConfirm` at the call site. */
export function useDeleteFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: FileModel) => deleteFile(file),
    onSuccess: (_data, file) => {
      toast.success("File deleted", { description: "File has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: qk.files.all });
      if (file.user_id) {
        queryClient.invalidateQueries({ queryKey: qk.profile.files(file.user_id) });
      }
    },
  });
}

export function useUpdateFileMeta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, meta }: { id: string; meta: FileMetaInput }) => updateFileMeta(id, meta),
    onSuccess: () => {
      toast.success("File updated", { description: "File has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: qk.files.all });
    },
  });
}
