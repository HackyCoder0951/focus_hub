import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType2,
  FileVideo,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileKind, type FileKind } from "../lib/file-utils";

const KIND_CONFIG: Record<FileKind, { icon: LucideIcon; tile: string }> = {
  pdf: { icon: FileText, tile: "bg-destructive/10 text-destructive" },
  doc: { icon: FileType2, tile: "bg-info/10 text-info" },
  sheet: { icon: FileSpreadsheet, tile: "bg-info/10 text-info" },
  slides: { icon: Presentation, tile: "bg-info/10 text-info" },
  image: { icon: FileImage, tile: "bg-success/10 text-success" },
  video: { icon: FileVideo, tile: "bg-warning/10 text-warning" },
  audio: { icon: FileAudio, tile: "bg-warning/10 text-warning" },
  archive: { icon: FileArchive, tile: "bg-accent text-accent-foreground" },
  code: { icon: FileCode, tile: "bg-accent text-accent-foreground" },
  text: { icon: FileText, tile: "bg-accent text-accent-foreground" },
  other: { icon: File, tile: "bg-accent text-accent-foreground" },
};

interface FileTypeIconProps {
  fileType?: string | null;
  fileName?: string | null;
  className?: string;
  iconClassName?: string;
}

/** File-type icon inside a semantic-token tinted tile. */
export function FileTypeIcon({ fileType, fileName, className, iconClassName }: FileTypeIconProps) {
  const kind = getFileKind(fileType, fileName);
  const { icon: Icon, tile } = KIND_CONFIG[kind];
  return (
    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", tile, className)}>
      <Icon className={cn("h-6 w-6", iconClassName)} />
    </div>
  );
}

export default FileTypeIcon;
