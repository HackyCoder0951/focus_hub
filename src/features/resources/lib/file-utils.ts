import type { FileModel, Profile } from "@/shared/types/db";

/** A filemodels row joined with the uploader's profile (optional — profile pages fetch without the join). */
export type FileWithProfile = FileModel & {
  profiles?: Pick<Profile, "full_name" | "avatar_url"> | null;
};

export type FileKind =
  | "image"
  | "video"
  | "pdf"
  | "doc"
  | "sheet"
  | "slides"
  | "archive"
  | "audio"
  | "text"
  | "code"
  | "other";

const TEXT_EXTENSIONS = ["txt", "md", "json", "js", "ts", "jsx", "tsx", "css", "html"];
const CODE_EXTENSIONS = ["js", "ts", "jsx", "tsx", "css", "html"];

export function getExtension(name?: string | null): string {
  return name?.split(".").pop()?.toLowerCase() ?? "";
}

export function getFileKind(type?: string | null, name?: string | null): FileKind {
  const mime = type?.toLowerCase() ?? "";
  const ext = getExtension(name);
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (["ppt", "pptx"].includes(ext)) return "slides";
  if (["zip", "rar", "7z"].includes(ext)) return "archive";
  if (mime.startsWith("audio/") || ["mp3", "wav", "ogg"].includes(ext)) return "audio";
  if (CODE_EXTENSIONS.includes(ext)) return "code";
  if (mime.startsWith("text/") || TEXT_EXTENSIONS.includes(ext)) return "text";
  return "other";
}

export function isTextLike(file: Pick<FileModel, "file_type" | "file_name">): boolean {
  const mime = file.file_type?.toLowerCase() ?? "";
  const ext = getExtension(file.file_name);
  return mime.startsWith("text/") || TEXT_EXTENSIONS.includes(ext);
}

export function canPreviewFile(file: Pick<FileModel, "file_type" | "file_name">): boolean {
  const mime = file.file_type?.toLowerCase() ?? "";
  return (
    mime.startsWith("image/") ||
    mime.startsWith("video/") ||
    mime.includes("pdf") ||
    getExtension(file.file_name) === "pdf" ||
    isTextLike(file)
  );
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
