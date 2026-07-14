import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, Eye, Link as LinkIcon, Pencil, Trash2 } from "lucide-react";
import { formatFileSize, type FileWithProfile } from "../lib/file-utils";
import { FileTypeIcon } from "./FileTypeIcon";
import { copyFileLink } from "./FileCard";

export interface FileListRowProps {
  file: FileWithProfile;
  onPreview?: (file: FileWithProfile) => void;
  onEdit?: (file: FileWithProfile) => void;
  onDelete?: (file: FileWithProfile) => void;
  canManageFile?: boolean;
}

export function FileListRow({ file, onPreview, onEdit, onDelete, canManageFile }: FileListRowProps) {
  return (
    <div className="p-4 transition-colors hover:bg-accent/40">
      <div className="flex items-center gap-4">
        <FileTypeIcon fileType={file.file_type} fileName={file.file_name} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold" title={file.file_name}>
            {file.file_name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formatFileSize(file.file_size)}</span>
            <span>&bull;</span>
            <span>{file.created_at ? new Date(file.created_at).toLocaleDateString() : ""}</span>
            {file.is_public && (
              <Badge variant="outline" className="text-xs">
                Public
              </Badge>
            )}
          </div>
          {file.description && (
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{file.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {file.profiles && (
            <Avatar className="hidden h-8 w-8 sm:block">
              <AvatarImage src={file.profiles.avatar_url ?? undefined} />
              <AvatarFallback>{file.profiles.full_name?.charAt(0) ?? "?"}</AvatarFallback>
            </Avatar>
          )}
          <div className="flex gap-1">
            {onPreview && (
              <Button size="sm" variant="outline" onClick={() => onPreview(file)} title="Preview">
                <Eye className="h-4 w-4" />
                <span className="sr-only">Preview</span>
              </Button>
            )}
            <Button size="sm" variant="outline" asChild title="Download">
              <a href={file.file_url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </a>
            </Button>
            <Button size="sm" variant="outline" onClick={() => copyFileLink(file)} title="Copy share link">
              <LinkIcon className="h-4 w-4" />
              <span className="sr-only">Copy share link</span>
            </Button>
            {canManageFile && onEdit && (
              <Button size="sm" variant="outline" onClick={() => onEdit(file)} title="Edit">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            {canManageFile && onDelete && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(file)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileListRow;
